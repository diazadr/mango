<?php

namespace App\Services\Admin\RBAC;

use App\Models\User;

class UserRoleService
{
    public function syncRoles(User $user, array $data)
    {
        $user->syncRoles($data['roles']);

        return $user->load('roles', 'permissions');
    }

    public function addRole(User $user, array $data)
    {
        $user->assignRole($data['role']);

        return $user->load('roles', 'permissions');
    }

    public function removeRole(User $user, array $data)
    {
        $user->removeRole($data['role']);

        return $user->load('roles', 'permissions');
    }

    public function syncPermissions(User $user, array $data)
    {
        $user->syncPermissions($data['permissions']);

        return $user->load('roles', 'permissions');
    }
}
