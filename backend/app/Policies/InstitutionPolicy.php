<?php

namespace App\Policies;

use App\Models\Master\Institution;
use App\Models\User;

class InstitutionPolicy
{
    public function view(User $user, Institution $institution)
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return $user->institutions()
            ->where('institutions.id', $institution->id)
            ->exists();
    }

    public function update(User $user, Institution $institution)
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return $user->institutions()
            ->where('institutions.id', $institution->id)
            ->exists();
    }

    public function delete(User $user, Institution $institution)
    {
        return $user->hasRole('super_admin');
    }
}
