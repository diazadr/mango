<?php

namespace App\Services\Payment;

use App\Models\Machine\MachineReservation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class XenditService
{
    private string $secretKey;

    public function __construct()
    {
        $this->secretKey = config('xendit.secret_key');
        if (empty($this->secretKey)) {
            Log::warning('XENDIT_SECRET_KEY belum dikonfigurasi.');
        }
    }

    /**
     * Membuat Sub-Account (xenPlatform) bertipe OWNED
     */
    public function createSubAccount(string $email, string $businessName, string $type = 'OWNED'): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->post('https://api.xendit.co/v2/accounts', [
                'email' => $email,
                'type' => $type,
                'public_profile' => [
                    'business_name' => $businessName,
                ]
            ]);

        if ($response->failed()) {
            Log::error('Xendit createSubAccount error', [
                'email' => $email,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
            throw new RuntimeException('Gagal membuat Sub-Account Xendit: ' . $response->body(), 500);
        }

        return $response->json();
    }

    /**
     * Mendapatkan daftar bank yang tersedia untuk pencairan dana (disbursements)
     */
    public function getAvailableBanks(): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->get('https://api.xendit.co/available_disbursements_banks');

        if ($response->failed()) {
            Log::error('Xendit getAvailableBanks error', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
            throw new RuntimeException('Gagal mengambil daftar bank Xendit: ' . $response->body(), 500);
        }

        return $response->json();
    }

    /**
     * Mendapatkan saldo (balance) dari akun (atau sub-account)
     */
    public function getBalance(?string $subAccountId = null): array
    {
        if ($subAccountId && str_starts_with($subAccountId, 'TEST_')) {
            // Mock balance for testing UI
            $mockBalance = \Illuminate\Support\Facades\Cache::get("mock_balance_{$subAccountId}", 6000000);
            return [
                'balance' => $mockBalance
            ];
        }

        $request = Http::withBasicAuth($this->secretKey, '');
        
        if (!empty($subAccountId)) {
            $request->withHeaders([
                'for-user-id' => $subAccountId,
            ]);
        }

        $response = $request->get('https://api.xendit.co/balance', [
            'account_type' => 'CASH'
        ]);

        if ($response->failed()) {
            Log::error('Xendit getBalance error', [
                'subAccountId' => $subAccountId,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
            throw new RuntimeException('Gagal mengambil saldo Xendit.', 500);
        }

        return $response->json();
    }

    /**
     * Membuat permintaan penarikan dana (Disbursement) ke rekening bank PT
     */
    public function createPayout(string $subAccountId, float $amount, string $bankCode, string $accountName, string $accountNumber, string $description = 'Penarikan Saldo PT'): array
    {
        if ($subAccountId && str_starts_with($subAccountId, 'TEST_')) {
            // Mock payout for testing UI
            $currentBalance = \Illuminate\Support\Facades\Cache::get("mock_balance_{$subAccountId}", 6000000);
            $totalDeduction = $amount + 5000;
            \Illuminate\Support\Facades\Cache::put("mock_balance_{$subAccountId}", max(0, $currentBalance - $totalDeduction));
            
            return [
                'id' => 'payout-test-' . time(),
                'status' => 'PENDING',
                'amount' => $amount
            ];
        }

        $response = Http::withBasicAuth($this->secretKey, '')
            ->withHeaders([
                'for-user-id' => $subAccountId,
            ])
            ->post('https://api.xendit.co/disbursements', [
                'external_id' => 'payout-' . $subAccountId . '-' . time(),
                'amount' => $amount,
                'bank_code' => $bankCode,
                'account_holder_name' => $accountName,
                'account_number' => $accountNumber,
                'description' => $description,
            ]);

        if ($response->failed()) {
            Log::error('Xendit createPayout error', [
                'subAccountId' => $subAccountId,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
            throw new RuntimeException('Gagal melakukan penarikan dana: ' . $response->body(), 500);
        }

        return $response->json();
    }

    /**
     * Buat Xendit Invoice untuk reservasi mesin.
     * Return array berisi invoice_id, invoice_url, expires_at, status, amount.
     */
    public function createInvoice(MachineReservation $reservation, ?string $subAccountId = null): array
    {
        $reservation->load(['machine', 'requesterUmkm', 'requesterUser']);

        $amount = (float) $reservation->quoted_price;

        if ($amount <= 0) {
            throw new RuntimeException('Harga reservasi belum ditetapkan atau tidak valid.', 422);
        }

        $expiryHours = (int) config('xendit.invoice_expiry_hours', 24);
        $expiryDate  = now()->addHours($expiryHours)->toIso8601String();

        $params = [
            'external_id'          => 'reservation-' . $reservation->id . '-' . time(),
            'amount'               => $amount,
            'description'          => 'Pembayaran Reservasi Mesin: ' . ($reservation->machine->name ?? 'Mesin #' . $reservation->machine_id),
            'invoice_duration'     => $expiryHours * 3600,
            'customer'             => [
                'given_names'  => $reservation->requesterUser?->name ?? 'UMKM',
                'email'        => $reservation->requesterUser?->email ?? null,
            ],
            'customer_notification_preference' => [
                'invoice_created'  => ['whatsapp', 'email', 'sms'],
                'invoice_reminder' => ['whatsapp', 'email', 'sms'],
                'invoice_paid'     => ['whatsapp', 'email', 'sms'],
            ],
            'success_redirect_url' => config('xendit.success_redirect_url') . '/' . $reservation->id . '?payment=success',
            'failure_redirect_url' => config('xendit.failure_redirect_url') . '/' . $reservation->id . '?payment=failed',
            'payment_methods'      => config('xendit.payment_methods'),
            'items'                => [
                [
                    'name'     => 'Sewa Mesin: ' . ($reservation->machine->name ?? 'Mesin #' . $reservation->machine_id),
                    'quantity' => 1,
                    'price'    => $amount,
                    'category' => 'Machine Rental',
                ],
            ],
        ];

        $request = Http::withBasicAuth($this->secretKey, '');
        
        if (!empty($subAccountId)) {
            $request->withHeaders([
                'for-user-id' => $subAccountId,
            ]);
        }

        $response = $request->post('https://api.xendit.co/v2/invoices', $params);

        if ($response->failed()) {
            Log::error('Xendit createInvoice error', [
                'reservation_id' => $reservation->id,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
            throw new RuntimeException('Gagal membuat invoice Xendit: ' . $response->body(), 500);
        }

        $data = $response->json();

        if (empty($data['id']) || empty($data['invoice_url'])) {
            Log::error('Xendit createInvoice invalid response', ['response' => $data]);
            throw new RuntimeException('Gagal membuat invoice Xendit: respons tidak valid.', 500);
        }

        return [
            'invoice_id'  => $data['id'],
            'invoice_url' => $data['invoice_url'],
            'expires_at'  => $data['expiry_date'] ?? $expiryDate,
            'status'      => $data['status'],
            'amount'      => $data['amount'],
        ];
    }

    /**
     * Ambil detail invoice dari Xendit.
     */
    public function getInvoice(string $invoiceId, ?string $subAccountId = null): array
    {
        $request = Http::withBasicAuth($this->secretKey, '');
        
        if (!empty($subAccountId)) {
            $request->withHeaders([
                'for-user-id' => $subAccountId,
            ]);
        }

        $response = $request->get("https://api.xendit.co/v2/invoices/{$invoiceId}");

        if ($response->failed()) {
            Log::error('Xendit getInvoice error', ['invoice_id' => $invoiceId, 'status' => $response->status(), 'body' => $response->json()]);
            throw new RuntimeException('Gagal mengambil data invoice Xendit.', 500);
        }

        return $response->json();
    }

    /**
     * Validasi x-callback-token dari header webhook Xendit.
     */
    public function validateWebhookToken(string $token): bool
    {
        $expected = config('xendit.webhook_token');
        if (empty($expected)) {
            // Jika token belum dikonfigurasi, log warning tapi tetap lanjut (dev mode)
            Log::warning('XENDIT_WEBHOOK_TOKEN belum dikonfigurasi — validasi dilewati.');
            return true;
        }
        return hash_equals($expected, $token);
    }
}
