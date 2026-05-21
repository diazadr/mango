<?php

namespace App\Services\Admin\RBAC;

use Spatie\Permission\Models\Permission;

class PermissionService
{
    public function create(array $data)
    {
        return Permission::create([
            'name' => $data['name'],
        ]);
    }

    public function update(Permission $permission, array $data)
    {
        $permission->update([
            'name' => $data['name'],
        ]);

        return $permission;
    }

    public function delete(Permission $permission)
    {
        return $permission->delete();
    }
}
