<?php

namespace App\Policies;

use App\Models\Assessment\AssessmentResult;
use App\Models\Umkm\Umkm;
use App\Models\User;

class AssessmentPolicy
{
    public function view(User $user, AssessmentResult $result): bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ((int) $result->user_id === (int) $user->id) {
            return true;
        }

        $umkm = $result->umkm;
        if (! $umkm) {
            return false;
        }

        return $user->organizations()
            ->where('organizations.id', $umkm->organization_id)
            ->exists();
    }

    public function update(User $user, AssessmentResult $result): bool
    {
        return $this->view($user, $result);
    }

    public function create(User $user, Umkm $umkm): bool
    {
        if ((int) $umkm->user_id === (int) $user->id) {
            return true;
        }

        return $user->hasRole('super_admin') ||
            $user->organizations()
                ->where('organizations.id', $umkm->organization_id)
                ->exists();
    }
}
