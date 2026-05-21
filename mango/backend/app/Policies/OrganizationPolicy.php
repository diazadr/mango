<?php

namespace App\Policies;

use App\Models\Master\Organization;
use App\Models\User;

class OrganizationPolicy
{
    public function view(User $user, Organization $organization)
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return $user->organizations()
            ->where('organizations.id', $organization->id)
            ->exists();
    }

    public function update(User $user, Organization $organization)
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return $user->organizations()
            ->where('organizations.id', $organization->id)
            ->exists();
    }

    public function delete(User $user, Organization $organization)
    {
        return $user->hasRole('super_admin');
    }
}
