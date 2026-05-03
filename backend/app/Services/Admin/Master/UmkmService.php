<?php

namespace App\Services\Admin\Master;

use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class UmkmService
{
    /**
     * Create a new UMKM and handle document uploads.
     */
    public function create(User $user, array $data): Umkm
    {
        return DB::transaction(function () use ($user, $data) {
            if (Umkm::where('user_id', $user->id)->exists()) {
                abort(409, 'UMKM sudah terdaftar untuk akun ini.');
            }

            // Extract files
            $logo = $data['logo'] ?? null;
            $nibFile = $data['nib_file'] ?? null;

            unset($data['logo'], $data['nib_file']);

            $data['registration_number'] = $this->generateMangoId();
            $data['status'] = 'pending'; // Start as pending for admin approval

            $umkm = Umkm::create([
                ...$data,
                'user_id' => $user->id,
            ]);

            // Handle Media
            if ($logo instanceof UploadedFile) {
                $umkm->addMedia($logo)->toMediaCollection('logos');
            }
            if ($nibFile instanceof UploadedFile) {
                $umkm->addMedia($nibFile)->toMediaCollection('nib_documents');
            }

            return $umkm;
        });
    }

    /**
     * Generate unique MANGO ID: MANGO-YYYY-XXXX
     */
    protected function generateMangoId(): string
    {
        $year = date('Y');
        $count = Umkm::whereYear('created_at', $year)->count() + 1;
        $number = str_pad($count, 4, '0', STR_PAD_LEFT);
        $id = "MANGO-{$year}-{$number}";

        while (Umkm::where('registration_number', $id)->exists()) {
            $count++;
            $number = str_pad($count, 4, '0', STR_PAD_LEFT);
            $id = "MANGO-{$year}-{$number}";
        }

        return $id;
    }

    /**
     * Update UMKM information and documents.
     */
    public function update(Umkm $umkm, array $data): Umkm
    {
        return DB::transaction(function () use ($umkm, $data) {
            // Handle Logo
            if (isset($data['logo']) && $data['logo'] instanceof UploadedFile) {
                $umkm->addMedia($data['logo'])->toMediaCollection('logos');
            }

            // Handle Documents
            if (isset($data['nib_file']) && $data['nib_file'] instanceof UploadedFile) {
                $umkm->addMedia($data['nib_file'])->toMediaCollection('nib_documents');
            }

            unset($data['logo'], $data['nib_file']);
            $umkm->update($data);

            return $umkm;
        });
    }

    /**
     * Approve UMKM.
     */
    public function approve(Umkm $umkm): void
    {
        $umkm->update([
            'status' => 'active',
            'is_active' => true,
            'rejection_reason' => null,
        ]);
    }

    /**
     * Reject UMKM.
     */
    public function reject(Umkm $umkm, string $reason): void
    {
        $umkm->update([
            'status' => 'rejected',
            'is_active' => false,
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Delete UMKM.
     */
    public function delete(Umkm $umkm): void
    {
        DB::transaction(function () use ($umkm) {
            $umkm->delete();
        });
    }
}
