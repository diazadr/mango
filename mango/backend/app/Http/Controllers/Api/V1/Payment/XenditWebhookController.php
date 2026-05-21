<?php

namespace App\Http\Controllers\Api\V1\Payment;

use App\Http\Controllers\Controller;
use App\Models\Machine\MachineReservation;
use App\Notifications\Reservation\PaymentPaid;
use App\Notifications\Reservation\PaymentReceived;
use App\Services\Payment\XenditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class XenditWebhookController extends Controller
{
    public function __construct(
        protected XenditService $xenditService
    ) {}

    /**
     * Webhook url: POST /v1/webhooks/xendit
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            // Validasi Token Webhook
            $token = $request->header('x-callback-token');
            if (!$token || !$this->xenditService->validateWebhookToken($token)) {
                Log::warning('Xendit Webhook - Invalid Token', ['ip' => $request->ip()]);
                return response()->json(['message' => 'Invalid token'], 403);
            }

            $data = $request->all();
            
            // Cek apakah ini callback untuk Invoice
            if (!isset($data['id']) || !isset($data['external_id']) || !isset($data['status'])) {
                return response()->json(['message' => 'Invalid payload format'], 400);
            }

            // external_id format: reservation-{id}-{timestamp}
            $externalId = $data['external_id'];
            if (!str_starts_with($externalId, 'reservation-')) {
                return response()->json(['message' => 'Not a reservation invoice'], 200);
            }

            $parts = explode('-', $externalId);
            $reservationId = $parts[1] ?? null;

            if (!$reservationId) {
                return response()->json(['message' => 'Reservation ID not found in external_id'], 400);
            }

            $reservation = MachineReservation::with(['machine.owner', 'requesterUser'])->find($reservationId);
            
            if (!$reservation) {
                Log::error('Xendit Webhook - Reservation Not Found', ['id' => $reservationId]);
                return response()->json(['message' => 'Reservation not found'], 404);
            }

            // Jika status Xendit adalah PAID
            if ($data['status'] === 'PAID') {
                DB::transaction(function () use ($reservation, $data) {
                    $reservation->update([
                        'payment_status'        => 'paid',
                        'paid_at'               => now(),
                        'xendit_payment_method' => $data['payment_method'] ?? null,
                        'xendit_paid_amount'    => $data['paid_amount'] ?? $data['amount'] ?? null,
                        'status'                => 'completed', // Langsung selesai karena gateway terverifikasi
                    ]);
                });

                // Kirim notifikasi
                // 1. Ke pemohon
                if ($reservation->requesterUser) {
                    $reservation->requesterUser->notify(new PaymentPaid($reservation));
                }

                // 2. Ke pemilik mesin
                $machineOwner = $reservation->machine?->owner;
                if ($machineOwner) {
                    // Jika owner adalah institusi/organisasi, notifikasi dikirim ke PIC/Admin mereka
                    // Ini disesuaikan dengan struktur owner yang ada
                    if (method_exists($machineOwner, 'notify')) {
                        $machineOwner->notify(new PaymentReceived($reservation));
                    }
                }
            } 
            // Jika invoice EXPIRED
            elseif ($data['status'] === 'EXPIRED') {
                // Bisa reset invoice ID atau biarkan user generate ulang via UI
                Log::info('Xendit Invoice Expired', ['reservation_id' => $reservation->id]);
            }

            return response()->json(['message' => 'Webhook processed successfully'], 200);
            
        } catch (Throwable $e) {
            Log::error('Xendit Webhook Error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server Error'], 500);
        }
    }
}
