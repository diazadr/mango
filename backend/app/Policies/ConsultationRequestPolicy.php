<?php

namespace App\Policies;

use App\Models\Mentoring\ConsultationRequest;
use App\Models\User;

class ConsultationRequestPolicy
{
    public function viewAny(
        User $user
    ): bool {
        return $user->hasAnyRole([
            'super_admin',
            'admin',
            'upt',
            'advisor',
            'umkm',
        ]);
    }

    public function view(
        User $user,
        ConsultationRequest $request
    ): bool {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return true;
        }

        if ($request->requested_by === $user->id) {
            return true;
        }

        if ($request->assignments()->where('mentor_user_id', $user->id)->exists()) {
            return true;
        }

        return $user->institutions()
            ->where(
                'institutions.id',
                $request->institution_id
            )
            ->exists();
    }

    public function create(
        User $user
    ): bool {
        return $user->hasRole('umkm');
    }

    public function update(
        User $user,
        ConsultationRequest $request
    ): bool {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return true;
        }

        return $user->hasRole('upt') &&
        $user->institutions()
            ->where(
                'institutions.id',
                $request->institution_id
            )
            ->exists();
    }

    public function consult(
        User $user,
        ConsultationRequest $request
    ): bool {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return true;
        }

        return $request->assignments()->where('mentor_user_id', $user->id)->exists();
    }
}
