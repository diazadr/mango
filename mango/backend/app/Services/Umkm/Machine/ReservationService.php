<?php

namespace App\Services\Umkm\Machine;

use App\Models\Machine\Machine;
use App\Models\Machine\MachineReservation;
use App\Models\Machine\ReservationApproval;
use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Models\Machine\MachineReservationNegotiation;
use App\Models\Machine\MachineReservationCancellation;
use App\Services\Payment\XenditService;
use RuntimeException;

class ReservationService
{
    public function getReservations(array $filters): LengthAwarePaginator
    {
        $query = MachineReservation::query()
            ->with(['machine.owner', 'requesterUmkm', 'requesterUser', 'media', 'negotiations', 'activeCancellation']);

        if (isset($filters['umkm_id'])) {
            $query->where('requester_umkm_id', $filters['umkm_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        } elseif (empty($filters['include_completed'])) {
            // Completed reservations are shown in history only, not in the active transaction list
            $query->where('status', '!=', 'completed');
        }

        $query->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_dir'] ?? 'desc');

        return $query->paginate(min((int) ($filters['per_page'] ?? 15), 100));
    }

    public function getIncomingReservations(array $filters, User $user): LengthAwarePaginator
    {
        $query = MachineReservation::query()
            ->with(['machine.owner', 'requesterUmkm', 'requesterUser', 'media', 'negotiations', 'activeCancellation'])
            ->where('status', '!=', 'completed') // Completed go to history, not active transactions
            ->whereHas('machine', function (Builder $builder) use ($user) {
                if ($user->umkm) {
                    $builder->where('owner_id', $user->umkm->id)
                            ->where('owner_type', Umkm::class);
                    return;
                }

                $builder->where(function ($q) use ($user) {
                    $institutions = $user->institutions->pluck('id')->values();
                    if ($institutions->isNotEmpty()) {
                        $q->orWhere(function ($q2) use ($institutions) {
                            $q2->whereIn('owner_id', $institutions)
                               ->where('owner_type', \App\Models\Master\Institution::class);
                        });
                    }

                    $organizations = $user->organizations->pluck('id')->values();
                    if ($organizations->isNotEmpty()) {
                        $q->orWhere(function ($q2) use ($organizations) {
                            $q2->whereIn('owner_id', $organizations)
                               ->where('owner_type', \App\Models\Master\Organization::class);
                        });
                    }
                });
            });

        $query->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_dir'] ?? 'desc');

        return $query->paginate(min((int) ($filters['per_page'] ?? 15), 100));
    }

    public function storeReservation(User $user, array $data, ?UploadedFile $designFile = null): MachineReservation
    {
        if (!$user->umkm) {
            throw new RuntimeException('Only UMKM users can make reservations');
        }

        $machine = Machine::findOrFail($data['machine_id']);

        // [FIX] Validasi mesin milik sendiri – semua jenis pemilik (UMKM, Institution, Organization)
        if ($this->isMachineOwner($machine, $user)) {
            throw new RuntimeException('Anda tidak dapat mereservasi mesin milik Anda sendiri.', 422);
        }

        // [FIX] Validasi is_reservable
        if (! $machine->is_reservable) {
            throw new RuntimeException('Mesin ini tidak tersedia untuk disewa.', 422);
        }

        // [FIX] Validasi status maintenance
        if ($machine->status === 'maintenance') {
            throw new RuntimeException('Mesin sedang dalam perbaikan (maintenance) dan tidak dapat dipesan.', 422);
        }

        $conflict = MachineReservation::query()
            ->where('machine_id', $machine->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function (Builder $builder) use ($data) {
                $builder->where('start_time', '<', $data['end_time'])
                        ->where('end_time', '>', $data['start_time']);
            })
            ->exists();

        if ($conflict) {
            throw new RuntimeException('Machine is already reserved during this time', 409);
        }

        $hasProposedPrice = isset($data['proposed_price']) && $data['proposed_price'] !== null;

        $reservation = MachineReservation::create([
            'machine_id'           => $machine->id,
            'start_time'           => $data['start_time'],
            'end_time'             => $data['end_time'],
            'purpose'              => $data['purpose'] ?? null,
            'requester_umkm_id'    => $user->umkm->id,
            'requested_by_user_id' => $user->id,
            'status'               => $hasProposedPrice ? 'negotiating' : 'pending',
            'payment_status'       => 'unpaid',
        ]);

        if ($hasProposedPrice) {
            MachineReservationNegotiation::create([
                'machine_reservation_id' => $reservation->id,
                'user_id'                => $user->id,
                'offered_price'          => $data['proposed_price'],
                'notes'                  => 'Initial price proposal by requester.',
                'status'                 => 'pending',
            ]);
        }

        if ($designFile) {
            $reservation->addMedia($designFile)
                ->usingName($designFile->getClientOriginalName())
                ->toMediaCollection('design_files');
        }

        return $reservation;
    }

    public function proposePrice(MachineReservation $reservation, User $user, array $data): MachineReservation
    {
        $isOwner = $this->isMachineOwner($reservation->machine, $user);
        $isRequester = $user->umkm && (int) $reservation->requester_umkm_id === (int) $user->umkm->id;

        if (!$isOwner && !$isRequester) {
            throw new RuntimeException('Only the machine owner or requester can negotiate price', 403);
        }

        if (!in_array($reservation->status, ['pending', 'negotiating'])) {
            throw new RuntimeException('Reservation must be pending or negotiating to propose a price', 422);
        }

        return DB::transaction(function () use ($reservation, $user, $data) {
            // Supersede any pending negotiations
            $reservation->negotiations()->where('status', 'pending')->update(['status' => 'superseded']);

            MachineReservationNegotiation::create([
                'machine_reservation_id' => $reservation->id,
                'user_id'                => $user->id,
                'offered_price'          => $data['proposed_price'],
                'notes'                  => $data['notes'] ?? null,
                'status'                 => 'pending',
            ]);

            if ($reservation->status !== 'negotiating') {
                $reservation->update(['status' => 'negotiating']);
            }

            return $reservation->fresh(['negotiations.user']);
        });
    }

    public function respondNegotiation(MachineReservation $reservation, MachineReservationNegotiation $negotiation, User $user, array $data): MachineReservation
    {
        $isOwner = $this->isMachineOwner($reservation->machine, $user);
        $isRequester = $user->umkm && (int) $reservation->requester_umkm_id === (int) $user->umkm->id;

        if (!$isOwner && !$isRequester) {
            throw new RuntimeException('Only the machine owner or requester can respond to a negotiation', 403);
        }

        if ($negotiation->machine_reservation_id !== $reservation->id) {
            throw new RuntimeException('Negotiation does not belong to this reservation', 404);
        }

        if ($negotiation->status !== 'pending') {
            throw new RuntimeException('Can only respond to a pending negotiation', 422);
        }

        if ((int)$negotiation->user_id === (int)$user->id) {
            throw new RuntimeException('You cannot respond to your own proposal', 403);
        }

        return DB::transaction(function () use ($reservation, $negotiation, $data) {
            $isAccept = $data['action'] === 'accept';
            $status = $isAccept ? 'accepted' : 'rejected';

            $negotiation->update(['status' => $status]);

            if ($isAccept) {
                // If accepted, the reservation is approved with this price
                $reservation->update([
                    'status' => 'approved',
                    'quoted_price' => $negotiation->offered_price,
                    'quotation_notes' => 'Agreed via negotiation.',
                ]);
            } else {
                // If rejected, the reservation is rejected
                $reservation->update([
                    'status' => 'rejected',
                    'rejection_reason' => $data['notes'] ?? 'Negotiation rejected.',
                ]);
            }

            return $reservation->fresh(['negotiations.user']);
        });
    }

    public function requestCancellation(MachineReservation $reservation, User $user, array $data): MachineReservation
    {
        $isOwner = $this->isMachineOwner($reservation->machine, $user);
        $isRequester = $user->umkm && (int) $reservation->requester_umkm_id === (int) $user->umkm->id;

        if (!$isOwner && !$isRequester) {
            throw new RuntimeException('Only the machine owner or requester can request cancellation', 403);
        }

        if (in_array($reservation->status, ['completed', 'cancelled', 'rejected'])) {
            throw new RuntimeException('Cannot cancel a reservation that is already completed, cancelled, or rejected', 422);
        }

        if (in_array($reservation->payment_status, ['paid', 'refunded'])) {
            throw new RuntimeException('Cannot cancel a reservation after payment is completed', 422);
        }

        if ($reservation->activeCancellation) {
            throw new RuntimeException('A cancellation request is already pending', 422);
        }

        return DB::transaction(function () use ($reservation, $user, $data) {
            MachineReservationCancellation::create([
                'machine_reservation_id' => $reservation->id,
                'requested_by_user_id'   => $user->id,
                'reason'                 => $data['reason'],
                'status'                 => 'pending',
                'previous_status'        => $reservation->status,
            ]);

            $reservation->update(['status' => 'cancel_requested']);

            return $reservation->fresh(['activeCancellation']);
        });
    }

    public function respondCancellation(MachineReservation $reservation, MachineReservationCancellation $cancellation, User $user, array $data): MachineReservation
    {
        $isOwner = $this->isMachineOwner($reservation->machine, $user);
        $isRequester = $user->umkm && (int) $reservation->requester_umkm_id === (int) $user->umkm->id;

        if (!$isOwner && !$isRequester) {
            throw new RuntimeException('Only the machine owner or requester can respond to cancellation', 403);
        }

        if ($cancellation->machine_reservation_id !== $reservation->id) {
            throw new RuntimeException('Cancellation does not belong to this reservation', 404);
        }

        if ($cancellation->status !== 'pending') {
            throw new RuntimeException('Can only respond to a pending cancellation', 422);
        }

        if ((int)$cancellation->requested_by_user_id === (int)$user->id) {
            throw new RuntimeException('You cannot respond to your own cancellation request', 403);
        }

        return DB::transaction(function () use ($reservation, $cancellation, $user, $data) {
            $isApprove = $data['action'] === 'approve';
            $status = $isApprove ? 'approved' : 'rejected';

            $cancellation->update([
                'status' => $status,
                'responded_by_user_id' => $user->id,
                'response_notes' => $data['notes'] ?? null,
            ]);

            if ($isApprove) {
                $reservation->update(['status' => 'cancelled']);
            } else {
                // Revert to previous status
                $reservation->update(['status' => $cancellation->previous_status]);
            }

            return $reservation->fresh(['activeCancellation']);
        });
    }

    public function processApproval(
        MachineReservation $reservation,
        User $user,
        array $data
    ): MachineReservation {
        return DB::transaction(function () use ($reservation, $user, $data) {
            $isApprove = $data['action'] === 'approve';
            $status    = $isApprove ? 'approved' : 'rejected';

            $updates = [
                'status'           => $status,
                'rejection_reason' => !$isApprove ? ($data['comment'] ?? null) : null,
            ];

            if ($isApprove) {
                if (isset($data['quoted_price'])) {
                    $updates['quoted_price'] = $data['quoted_price'];
                } else {
                    // Jika disetujui tanpa memberikan quoted_price, otomatis hitung harga standar
                    $start = \Carbon\Carbon::parse($reservation->start_time);
                    $end = \Carbon\Carbon::parse($reservation->end_time);
                    $hours = max(0, $start->diffInMinutes($end) / 60);
                    $updates['quoted_price'] = $reservation->quoted_price ?? ($hours * ($reservation->machine->hourly_rate ?? 0));
                }
                
                $updates['quotation_notes'] = $data['quotation_notes'] ?? ($data['comment'] ?? null);
                // When approved with a price, keep payment_status as unpaid so requester can pay
            }

            $reservation->update($updates);

            ReservationApproval::create([
                'reservation_id' => $reservation->id,
                'user_id'        => $user->id,
                'status'         => $status,
                'notes'          => $data['comment'] ?? null,
            ]);

            return $reservation->fresh();
        });
    }

    /**
     * Submit payment proof (bukti transfer) by the requester UMKM.
     */
    public function submitPaymentProof(
        MachineReservation $reservation,
        User $user,
        array $data,
        ?UploadedFile $proofFile = null
    ): MachineReservation {
        if ($reservation->requester_umkm_id !== $user->umkm?->id) {
            throw new RuntimeException('You can only pay for your own reservations', 403);
        }

        if ($reservation->status !== 'approved') {
            throw new RuntimeException('Reservation must be approved before payment', 422);
        }

        if ($reservation->payment_status === 'paid') {
            throw new RuntimeException('Reservation is already paid', 422);
        }

        return DB::transaction(function () use ($reservation, $data, $proofFile) {
            $reservation->update([
                'payment_status' => 'paid',
                'paid_at'        => now(),
                'payment_method' => $data['payment_method'] ?? 'transfer',
                'payment_notes'  => $data['payment_notes'] ?? null,
                'status'         => 'completed',
            ]);

            if ($proofFile) {
                $reservation->addMedia($proofFile)
                    ->usingName('bukti-transfer-' . $reservation->id)
                    ->toMediaCollection('payment_proofs');
            }

            return $reservation->fresh();
        });
    }

    /**
     * Create Xendit Payment for a Reservation.
     */
    public function createXenditPayment(MachineReservation $reservation, User $user, XenditService $xenditService): array
    {
        if ($reservation->requester_umkm_id !== $user->umkm?->id) {
            throw new RuntimeException('You can only pay for your own reservations', 403);
        }

        if ($reservation->status !== 'approved') {
            throw new RuntimeException('Reservation must be approved before payment', 422);
        }

        if ($reservation->payment_status === 'paid') {
            throw new RuntimeException('Reservation is already paid', 422);
        }

        // Jika sudah ada invoice dan belum expired, return yang sudah ada saja
        if ($reservation->xendit_invoice_url && $reservation->xendit_expires_at && $reservation->xendit_expires_at->isFuture()) {
            return [
                'invoice_url' => $reservation->xendit_invoice_url,
            ];
        }

        // Dapatkan pemilik mesin
        $owner = $reservation->machine->owner;
        $subAccountId = $owner->xendit_sub_account_id ?? null;

        // Auto-register sub-account ke Xendit jika belum punya
        if (empty($subAccountId)) {
            $email = $owner->email ?? 'admin@mango-platform.com'; // fallback email
            $name  = $owner->name ?? 'Penyedia Mesin';
            
            try {
                $subAccount = $xenditService->createSubAccount($email, $name);
                $subAccountId = $subAccount['id'] ?? null;

                if ($subAccountId) {
                    // Simpan ID ini ke database
                    $owner->update(['xendit_sub_account_id' => $subAccountId]);
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Gagal membuat sub-account Xendit (mungkin karena permission API Key). Fallback ke master account.', [
                    'error' => $e->getMessage()
                ]);
                $subAccountId = null;
            }
        }

        // Generate invoice baru via XenditService menggunakan Sub-Account pemilik
        $invoice = $xenditService->createInvoice($reservation, $subAccountId);

        // Update record reservasi dengan info invoice
        $reservation->update([
            'xendit_invoice_id'  => $invoice['invoice_id'],
            'xendit_invoice_url' => $invoice['invoice_url'],
            'xendit_expires_at'  => $invoice['expires_at'],
            // update payment method jadi xendit supaya tahu user mencoba bayar via xendit
            'payment_method'     => 'xendit',
        ]);

        return [
            'invoice_url' => $invoice['invoice_url'],
        ];
    }

    /**
     * Confirm payment by machine owner.
     */
    public function confirmPayment(MachineReservation $reservation, User $user): MachineReservation
    {
        // [FIX IDOR] Pastikan user adalah pemilik mesin (validasi di service layer)
        if (! $this->isMachineOwner($reservation->machine, $user)) {
            throw new RuntimeException('Hanya pemilik mesin yang dapat mengkonfirmasi pembayaran.', 403);
        }

        if ($reservation->payment_status !== 'awaiting_confirmation') {
            throw new RuntimeException('Pembayaran belum dikirimkan oleh pemohon.', 422);
        }

        return DB::transaction(function () use ($reservation) {
            $reservation->update([
                'payment_status' => 'paid',
                'paid_at'        => now(),
                'status'         => 'completed',
            ]);

            return $reservation->fresh();
        });
    }

    /**
     * Helper: cek apakah user adalah pemilik dari mesin yang diberikan.
     */
    public function isMachineOwner(?Machine $machine, User $user): bool
    {
        if (! $machine) return false;
        if ($user->hasRole('super_admin') || $user->hasRole('admin')) return true;

        if ($user->umkm && $machine->owner_type === Umkm::class) {
            return (int) $machine->owner_id === (int) $user->umkm->id;
        }

        $institutionIds  = $user->institutions()->pluck('institutions.id')->toArray();
        $organizationIds = $user->organizations()->pluck('organizations.id')->toArray();

        if ($machine->owner_type === \App\Models\Master\Institution::class) {
            return in_array((int) $machine->owner_id, $institutionIds, true);
        }

        if ($machine->owner_type === Organization::class) {
            return in_array((int) $machine->owner_id, $organizationIds, true);
        }

        return false;
    }
}
