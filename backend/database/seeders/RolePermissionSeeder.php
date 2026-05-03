<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'access admin panel',

            'manage organizations',
            'manage departments',
            'manage users',
            'view umkm',

            'manage roles',
            'manage permissions',

            'view user roles',
            'assign roles',
            'assign permissions',

            'machine.read',
            'machine.create',
            'machine.update',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $upt = Role::firstOrCreate(['name' => 'upt']);
        $advisor = Role::firstOrCreate(['name' => 'advisor']);
        $umkm = Role::firstOrCreate(['name' => 'umkm']);

        $superAdmin->syncPermissions($permissions);

        $admin->syncPermissions([
            'access admin panel',
            'manage organizations',
            'manage departments',
            'manage users',
            'view umkm',
        ]);

        $upt->syncPermissions([
            'access admin panel',
            'view umkm',
            'manage users',
        ]);

        $advisor->syncPermissions([
            'view umkm',
        ]);

        $umkm->syncPermissions([
            'machine.read',
            'machine.create',
            'machine.update',
        ]);
    }
}
