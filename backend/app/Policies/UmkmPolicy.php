<?php

namespace App\Policies;

use App\Models\Umkm\Umkm;
use App\Models\User;

class UmkmPolicy
{
    public function view(
        User $user,
        Umkm $umkm
    ): bool {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ((int) $umkm->user_id === (int) $user->id) {
            return true;
        }

        return $user->organizations()
            ->where(
                'organizations.id',
                $umkm->organization_id
            )
            ->exists();
    }

    public function update(
        User $user,
        Umkm $umkm
    ): bool {
        if ((int) $umkm->user_id === (int) $user->id) {
            return true;
        }

        return $user->hasRole('super_admin')
            || (
                $user->hasAnyRole([
                    'admin',
                    'upt',
                ]) &&
                $user->organizations()
                    ->where(
                        'organizations.id',
                        $umkm->organization_id
                    )
                    ->exists()
            );
    }

    public function delete(
        User $user,
        Umkm $umkm
    ): bool {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ((int) $umkm->user_id === (int) $user->id) {
            return true;
        }

        return $user->hasAnyRole([
            'admin',
            'upt',
        ]) &&
        $user->organizations()
            ->where(
                'organizations.id',
                $umkm->organization_id
            )
            ->exists();
    }

    public function approve(
        User $user,
        Umkm $umkm
    ): bool {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return $user->hasAnyRole([
            'admin',
            'upt',
        ]) &&
        $user->organizations()
            ->where(
                'organizations.id',
                $umkm->organization_id
            )
            ->exists();
    }
}
