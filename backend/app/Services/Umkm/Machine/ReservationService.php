<?php

namespace App\Services\Umkm\Machine;

use App\Models\Machine\Machine;
use App\Models\Machine\MachineReservation;
use App\Models\Machine\ReservationApproval;
use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReservationService
{
    public function getReservations(
        array $filters
    ): LengthAwarePaginator {
        $query = MachineReservation::query()
            ->with([
                'machine',
                'requesterUmkm',
                'requesterUser',
            ]);

        if (isset($filters['umkm_id'])) {
            $query->where(
                'requester_umkm_id',
                $filters['umkm_id']
            );
        }

        if (isset($filters['status'])) {
            $query->where(
                'status',
                $filters['status']
            );
        }

        $query->orderBy(
            $filters['sort_by'] ?? 'created_at',
            $filters['sort_dir'] ?? 'desc'
        );

        return $query->paginate(
            min((int) ($filters['per_page'] ?? 15), 100)
        );
    }

    public function getIncomingReservations(
        array $filters,
        User $user
    ): LengthAwarePaginator {
        $query = MachineReservation::query()
            ->with([
                'machine',
                'requesterUmkm',
                'requesterUser',
            ])
            ->whereHas(
                'machine',
                function (Builder $builder) use ($user) {
                    if ($user->umkm) {
                        $builder
                            ->where(
                                'owner_id',
                                $user->umkm->id
                            )
                            ->where(
                                'owner_type',
                                Umkm::class
                            );

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
                }
            );

        $query->orderBy(
            $filters['sort_by'] ?? 'created_at',
            $filters['sort_dir'] ?? 'desc'
        );

        return $query->paginate(
            min((int) ($filters['per_page'] ?? 15), 100)
        );
    }

    public function storeReservation(
        User $user,
        array $data
    ): MachineReservation {
        if (! $user->umkm) {
            throw new RuntimeException(
                'Only UMKM users can make reservations'
            );
        }

        $machine = Machine::findOrFail(
            $data['machine_id']
        );

        if (
            $machine->owner_type === Umkm::class &&
            $machine->owner_id === $user->umkm->id
        ) {
            throw new RuntimeException(
                'You cannot reserve your own machine'
            );
        }

        $conflict = MachineReservation::query()
            ->where('machine_id', $machine->id)
            ->whereIn('status', [
                'pending',
                'approved',
            ])
            ->where(function (
                Builder $builder
            ) use ($data) {
                $builder
                    ->where(
                        'start_time',
                        '<',
                        $data['end_time']
                    )
                    ->where(
                        'end_time',
                        '>',
                        $data['start_time']
                    );
            })
            ->exists();

        if ($conflict) {
            throw new RuntimeException(
                'Machine is already reserved during this time'
            );
        }

        return MachineReservation::create([
            'machine_id' => $machine->id,
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'purpose' => $data['purpose'] ?? null,
            'requester_umkm_id' => $user->umkm->id,
            'requested_by_user_id' => $user->id,
            'status' => 'pending',
        ]);
    }

    public function processApproval(
        MachineReservation $reservation,
        User $user,
        array $data
    ): MachineReservation {
        return DB::transaction(
            function () use (
                $reservation,
                $user,
                $data
            ) {
                $isApprove = $data['action'] === 'approve';
                $status    = $isApprove ? 'approved' : 'rejected';

                // Update the reservation status + store rejection reason if rejected
                $reservation->update([
                    'status'           => $status,
                    'rejection_reason' => ! $isApprove
                        ? ($data['comment'] ?? null)
                        : null,
                ]);

                // Record the approval log — column names match reservation_approvals table
                ReservationApproval::create([
                    'reservation_id' => $reservation->id,
                    'user_id'        => $user->id,
                    'status'         => $status,
                    'notes'          => $data['comment'] ?? null,
                ]);

                return $reservation->fresh();
            }
        );
    }
}
