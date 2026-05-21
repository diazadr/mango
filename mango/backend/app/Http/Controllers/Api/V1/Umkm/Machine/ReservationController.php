<?php

namespace App\Http\Controllers\Api\V1\Umkm\Machine;

use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\Machine\ApproveReservationRequest;
use App\Http\Requests\Umkm\Machine\StoreReservationRequest;
use App\Models\Machine\MachineReservation;
use App\Services\Payment\XenditService;
use App\Services\Umkm\Machine\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Barryvdh\DomPDF\Facade\Pdf;
use Throwable;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->all();
            if (!$request->user()->hasRole('super_admin') && $request->user()->umkm) {
                $filters['umkm_id'] = $request->user()->umkm->id;
            }
            $paginator = $this->service->getReservations($filters);
            $paginator->getCollection()->transform(fn($r) => $this->formatReservation($r));
            return response()->json($paginator);
        } catch (Throwable $e) {
            Log::error('Machine reservation index error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch reservations'], 500);
        }
    }

    public function show(MachineReservation $reservation, Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $reservation->load(['machine.owner', 'requesterUmkm', 'requesterUser', 'approvals', 'media', 'negotiations', 'activeCancellation']);

            // [FIX IDOR] Hanya pemilik mesin atau pemohon yang boleh melihat detail
            $isMachineOwner = $this->service->isMachineOwner($reservation->machine, $user);
            $isRequester    = $user->umkm && (int) $reservation->requester_umkm_id === (int) $user->umkm->id;
            $isAdmin        = $user->hasRole('super_admin') || $user->hasRole('admin');

            abort_unless($isMachineOwner || $isRequester || $isAdmin, 403, 'Anda tidak memiliki akses ke data reservasi ini.');

            return response()->json(['data' => $this->formatReservation($reservation)]);
        } catch (Throwable $e) {
            Log::error('Machine reservation show error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch reservation'], 500);
        }
    }

    public function incoming(Request $request): JsonResponse
    {
        try {
            $paginator = $this->service->getIncomingReservations($request->all(), $request->user());
            $paginator->getCollection()->transform(fn($r) => $this->formatReservation($r));
            return response()->json($paginator);
        } catch (Throwable $e) {
            Log::error('Machine reservation incoming error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Failed to fetch incoming reservations'], 500);
        }
    }

    /**
     * GET /v1/machines/reservations/history
     * Returns ALL reservations for the current user including completed ones (for history page).
     */
    public function history(Request $request): JsonResponse
    {
        try {
            $filters = $request->all();
            $filters['include_completed'] = true; // Signal to service to include completed
            if (!$request->user()->hasRole('super_admin') && $request->user()->umkm) {
                $filters['umkm_id'] = $request->user()->umkm->id;
            }
            $paginator = $this->service->getReservations($filters);
            $paginator->getCollection()->transform(fn($r) => $this->formatReservation($r));
            return response()->json($paginator);
        } catch (Throwable $e) {
            Log::error('Machine reservation history error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch reservation history'], 500);
        }
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        try {
            $reservation = $this->service->storeReservation(
                $request->user(),
                $request->validated(),
                $request->hasFile('design_file') ? $request->file('design_file') : null
            );

            return response()->json([
                'message' => 'Reservation request submitted successfully',
                'data'    => $this->formatReservation($reservation),
            ], 201);
        } catch (Throwable $e) {
            Log::error('Machine reservation store error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            $status = ($e->getCode() >= 400 && $e->getCode() <= 599) ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage() ?: 'Failed to create reservation'], $status);
        }
    }

    public function approve(ApproveReservationRequest $request, MachineReservation $reservation): JsonResponse
    {
        try {
            // [FIX IDOR] Hanya pemilik mesin yang boleh approve/reject
            $reservation->load('machine');
            abort_unless(
                $this->service->isMachineOwner($reservation->machine, $request->user()),
                403,
                'Hanya pemilik mesin yang dapat memproses reservasi ini.'
            );

            $updated = $this->service->processApproval($reservation, $request->user(), $request->validated());

            return response()->json([
                'message' => 'Reservation processed successfully',
                'data'    => $this->formatReservation($updated),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation approve error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update reservation'], 500);
        }
    }

    /**
     * POST /v1/machines/reservations/{reservation}/create-payment
     * Create Xendit Payment for a reservation.
     */
    public function createPayment(Request $request, MachineReservation $reservation, XenditService $xenditService): JsonResponse
    {
        try {
            $result = $this->service->createXenditPayment($reservation, $request->user(), $xenditService);

            return response()->json([
                'message' => 'Payment invoice created successfully',
                'data'    => $result,
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation create xendit payment error', ['message' => $e->getMessage()]);
            $status = ($e->getCode() >= 400 && $e->getCode() <= 599) ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $status);
        }
    }

    /**
     * POST /v1/machines/reservations/{reservation}/payment
     * Requester UMKM submits payment proof.
     */
    public function submitPayment(Request $request, MachineReservation $reservation): JsonResponse
    {
        $request->validate([
            'payment_method' => ['nullable', 'string', 'in:transfer,cash,qris,other'],
            'payment_notes'  => ['nullable', 'string', 'max:1000'],
            'proof_file'     => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ]);

        try {
            $updated = $this->service->submitPaymentProof(
                $reservation,
                $request->user(),
                $request->only(['payment_method', 'payment_notes']),
                $request->hasFile('proof_file') ? $request->file('proof_file') : null
            );

            return response()->json([
                'message' => 'Bukti pembayaran berhasil dikirim.',
                'data'    => $this->formatReservation($updated),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation payment error', ['message' => $e->getMessage()]);
            $status = ($e->getCode() >= 400 && $e->getCode() <= 599) ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $status);
        }
    }

    /**
     * POST /v1/machines/reservations/{reservation}/confirm-payment
     * Machine owner confirms payment.
     */
    public function confirmPayment(MachineReservation $reservation, Request $request): JsonResponse
    {
        try {
            // [FIX IDOR] Hanya pemilik mesin yang boleh konfirmasi pembayaran
            $reservation->load('machine');
            abort_unless(
                $this->service->isMachineOwner($reservation->machine, $request->user()),
                403,
                'Hanya pemilik mesin yang dapat mengkonfirmasi pembayaran.'
            );

            $updated = $this->service->confirmPayment($reservation, $request->user());
            return response()->json([
                'message' => 'Pembayaran dikonfirmasi. Reservasi selesai.',
                'data'    => $this->formatReservation($updated),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation confirm payment error', ['message' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function proposePrice(Request $request, MachineReservation $reservation): JsonResponse
    {
        $request->validate([
            'proposed_price' => ['required', 'numeric', 'min:0'],
            'notes'          => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $updated = $this->service->proposePrice($reservation, $request->user(), $request->only(['proposed_price', 'notes']));
            return response()->json([
                'message' => 'Price proposal submitted successfully',
                'data'    => $this->formatReservation($updated),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation propose price error', ['message' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function respondNegotiation(Request $request, MachineReservation $reservation, $negotiationId): JsonResponse
    {
        $request->validate([
            'action' => ['required', 'in:accept,reject'],
            'notes'  => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $negotiation = \App\Models\Machine\MachineReservationNegotiation::findOrFail($negotiationId);
            $updated = $this->service->respondNegotiation($reservation, $negotiation, $request->user(), $request->only(['action', 'notes']));
            
            return response()->json([
                'message' => 'Negotiation responded successfully',
                'data'    => $this->formatReservation($updated),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation respond negotiation error', ['message' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function requestCancellation(Request $request, MachineReservation $reservation): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        try {
            $updated = $this->service->requestCancellation($reservation, $request->user(), $request->only('reason'));
            return response()->json([
                'message' => 'Cancellation request submitted successfully',
                'data'    => $this->formatReservation($updated),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation request cancellation error', ['message' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function respondCancellation(Request $request, MachineReservation $reservation, $cancellationId): JsonResponse
    {
        $request->validate([
            'action' => ['required', 'in:approve,reject'],
            'notes'  => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $cancellation = \App\Models\Machine\MachineReservationCancellation::findOrFail($cancellationId);
            $updated = $this->service->respondCancellation($reservation, $cancellation, $request->user(), $request->only(['action', 'notes']));
            
            return response()->json([
                'message' => 'Cancellation responded successfully',
                'data'    => $this->formatReservation($updated),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation respond cancellation error', ['message' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function downloadPdf(MachineReservation $reservation, Request $request)
    {
        $user = $request->user();
        $reservation->load(['machine.owner', 'requesterUmkm', 'requesterUser']);

        $isMachineOwner = $this->service->isMachineOwner($reservation->machine, $user);
        $isRequester    = $user->umkm && (int) $reservation->requester_umkm_id === (int) $user->umkm->id;
        $isAdmin        = $user->hasRole('super_admin') || $user->hasRole('admin');
        abort_unless($isMachineOwner || $isRequester || $isAdmin, 403);

        $logoPath = public_path('images/logos/logo-mango.png');
        $mangoLogoBase64 = '';
        if (File::exists($logoPath)) {
            $mangoLogoBase64 = 'data:image/png;base64,' . base64_encode(File::get($logoPath));
        }

        $docUrl = config('app.frontend_url', config('app.url')) . '/id/document/invoice/' . $reservation->id;
        $qrSvgBase64 = '';
        try {
            $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                new \BaconQrCode\Renderer\RendererStyle\RendererStyle(80, 0),
                new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
            );
            $writer = new \BaconQrCode\Writer($renderer);
            $qrSvgBase64 = base64_encode($writer->writeString($docUrl));
        } catch (\Throwable $e) {
            \Log::warning('QR Code generation failed: ' . $e->getMessage());
        }

        $pdf = Pdf::loadView('pdf.invoice', compact(
            'reservation', 'mangoLogoBase64', 'qrSvgBase64'
        ))->setPaper('a4', 'portrait');

        return $pdf->download("Invoice_{$reservation->id}.pdf");
    }

    private function formatReservation(MachineReservation $r): array
    {
        // Use the already-loaded media relation if available, else fall back to getMedia()
        $allMedia = $r->relationLoaded('media') ? $r->media : $r->getMedia();

        $designFiles = $allMedia
            ->where('collection_name', 'design_files')
            ->map(fn($m) => [
                'id'           => $m->id,
                'name'         => $m->name,
                'file_name'    => $m->file_name,
                'size'         => $m->size,
                'mime_type'    => $m->mime_type,
                'download_url' => $m->getUrl(),
            ])->values()->toArray();

        $paymentProofs = $allMedia
            ->where('collection_name', 'payment_proofs')
            ->map(fn($m) => [
                'id'        => $m->id,
                'thumb_url' => $m->hasGeneratedConversion('thumb') ? $m->getUrl('thumb') : $m->getUrl(),
                'url'       => $m->getUrl(),
            ])->values()->toArray();

        return [
            'id'               => $r->id,
            'machine'          => $r->relationLoaded('machine') ? new \App\Http\Resources\Umkm\Machine\MachineResource($r->machine) : null,
            'requester_umkm'   => $r->relationLoaded('requesterUmkm') ? $r->requesterUmkm : null,
            'requester_user'   => $r->relationLoaded('requesterUser') ? $r->requesterUser : null,
            'start_time'       => $r->start_time?->toISOString(),
            'end_time'         => $r->end_time?->toISOString(),
            'duration_hours'   => round($r->duration_hours, 2),
            'purpose'          => $r->purpose,
            'status'           => $r->status,
            'rejection_reason' => $r->rejection_reason,
            // Quotation
            'quoted_price'     => $r->quoted_price ? (float) $r->quoted_price : null,
            'quotation_notes'  => $r->quotation_notes,
            // Payment
            'payment_status'   => $r->payment_status,
            'payment_method'   => $r->payment_method,
            'payment_notes'    => $r->payment_notes,
            'paid_at'          => $r->paid_at?->toISOString(),
            // Feature Relations
            'negotiations'     => $r->relationLoaded('negotiations') ? $r->negotiations : [],
            'approvals'        => $r->relationLoaded('approvals') ? $r->approvals->map(fn($a) => [
                'id'         => $a->id,
                'status'     => $a->status,
                'notes'      => $a->notes,
                'created_at' => $a->created_at?->toISOString(),
            ])->values() : [],
            'active_cancellation' => $r->relationLoaded('activeCancellation') ? $r->activeCancellation : null,
            // Media
            'design_files'     => $designFiles,
            'payment_proofs'   => $paymentProofs,
            'created_at'       => $r->created_at?->toISOString(),
        ];
    }
}
