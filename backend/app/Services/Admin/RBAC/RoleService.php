<?php

namespace App\Services\Admin\RBAC;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleService
{
    public function create(array $data)
    {
        $role = Role::create([
            'name' => $data['name'],
        ]);

        if (! empty($data['permissions'])) {
            $permissions = Permission::whereIn('name', $data['permissions'])->get();
            $role->syncPermissions($permissions);
        }

        return $role->load('permissions');
    }

    public function update(Role $role, array $data)
    {
        $role->update([
            'name' => $data['name'],
        ]);

        if (isset($data['permissions'])) {
            $permissions = Permission::whereIn('name', $data['permissions'])->get();
            $role->syncPermissions($permissions);
        }

        return $role->load('permissions');
    }

    public function delete(Role $role)
    {
        return $role->delete();
    }
}
