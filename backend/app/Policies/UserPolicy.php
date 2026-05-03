<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function create(User $authUser)
    {
        return $authUser->hasAnyRole(['super_admin', 'admin', 'upt']);
    }

    public function update(User $authUser, User $user)
    {
        if ($authUser->hasRole('super_admin')) {
            return true;
        }

        return $authUser->institutions()
            ->whereIn('institutions.id', $user->institutions()->pluck('institutions.id'))
            ->exists();
    }

    public function delete(User $authUser, User $user)
    {
        if ($authUser->hasRole('super_admin')) {
            return true;
        }

        return $authUser->institutions()
            ->whereIn('institutions.id', $user->institutions()->pluck('institutions.id'))
            ->exists();
    }
}
