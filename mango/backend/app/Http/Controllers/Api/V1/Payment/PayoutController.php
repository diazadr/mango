<?php

namespace App\Http\Controllers\Api\V1\Payment;

use App\Http\Controllers\Controller;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use App\Services\Payment\XenditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class PayoutController extends Controller
{
    private XenditService $xenditService;

    public function __construct(XenditService $xenditService)
    {
        $this->xenditService = $xenditService;
    }

    /**
     * Dapatkan sub-account ID dari entitas milik user yang sedang login
     */
    private function getOwnerEntity($user)
    {
        // 1. Cek UMKM
        if ($user->umkm && $user->umkm->xendit_sub_account_id) {
            return $user->umkm;
        }

        // 2. Cek Institution (ambil yang pertama)
        $institution = $user->institutions()->whereNotNull('xendit_sub_account_id')->first();
        if ($institution) {
            return $institution;
        }

        // 3. Cek Organization (ambil yang pertama)
        $organization = $user->organizations()->whereNotNull('xendit_sub_account_id')->first();
        if ($organization) {
            return $organization;
        }

        throw new RuntimeException('Entitas Anda belum terdaftar di sistem pembayaran Xendit. Silakan terima transaksi terlebih dahulu.', 404);
    }

    public function balance(Request $request)
    {
        try {
            $user = $request->user();
            $entity = $this->getOwnerEntity($user);
            
            $balance = $this->xenditService->getBalance($entity->xendit_sub_account_id);

            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => $balance['balance'] ?? 0,
                    'bank_code' => $entity->bank_code,
                    'bank_account_name' => $entity->bank_account_name,
                    'bank_account_number' => $entity->bank_account_number,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('PayoutController balance error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function banks()
    {
        try {
            $banks = $this->xenditService->getAvailableBanks();
            return response()->json([
                'success' => true,
                'data' => $banks
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function requestPayout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10000',
            'bank_code' => 'required|string',
            'bank_account_name' => 'required|string',
            'bank_account_number' => 'required|string',
        ]);

        try {
            $user = $request->user();
            $entity = $this->getOwnerEntity($user);
            $subAccountId = $entity->xendit_sub_account_id;

            // Simpan atau update info bank
            $entity->update([
                'bank_code' => $request->bank_code,
                'bank_account_name' => $request->bank_account_name,
                'bank_account_number' => $request->bank_account_number,
            ]);

            $amount = (float) $request->amount;
            $fee = 5000; // Biaya admin penarikan Xendit / Bank
            $totalDeduction = $amount + $fee;

            // Cek saldo
            $balanceData = $this->xenditService->getBalance($subAccountId);
            $currentBalance = $balanceData['balance'] ?? 0;

            if ($currentBalance < $totalDeduction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo tidak mencukupi. Penarikan sebesar Rp ' . number_format($amount, 0, ',', '.') . ' membutuhkan total saldo Rp ' . number_format($totalDeduction, 0, ',', '.') . ' (termasuk fee Rp 5.000).'
                ], 400);
            }

            // Eksekusi Payout
            $payout = $this->xenditService->createPayout(
                $subAccountId,
                $amount, // Jumlah yang akan ditransfer ke bank (tidak termasuk fee, fee akan dipotong otomatis oleh Xendit dari saldo sisa)
                $request->bank_code,
                $request->bank_account_name,
                $request->bank_account_number
            );

            return response()->json([
                'success' => true,
                'message' => 'Penarikan saldo berhasil diproses.',
                'data' => $payout
            ]);

        } catch (\Exception $e) {
            Log::error('PayoutController requestPayout error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
