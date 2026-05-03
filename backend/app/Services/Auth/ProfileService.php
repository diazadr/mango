<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileService
{
    /**
     * Update user profile information and avatar.
     */
    public function updateProfile(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            // Handle avatar upload if provided
            if (isset($data['avatar']) && $data['avatar'] instanceof UploadedFile) {
                $user->addMedia($data['avatar'])
                    ->toMediaCollection('avatars');

                unset($data['avatar']);
            }

            // Handle email change
            if (isset($data['email']) && $data['email'] !== $user->email) {
                $user->email_verified_at = null;
                $user->sendEmailVerificationNotification();
            }

            $user->update($data);

            return $user->load(['roles', 'institutions', 'organizations', 'umkm']);
        });
    }

    /**
     * Update user password.
     */
    public function updatePassword(User $user, array $data): void
    {
        DB::transaction(function () use ($user, $data) {

            if (! Hash::check($data['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Password saat ini salah.'],
                ]);
            }

            $user->update([
                'password' => Hash::make($data['password']),
            ]);
        });
    }
}
