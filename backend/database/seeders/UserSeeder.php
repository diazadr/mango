<?php

namespace Database\Seeders;

use App\Models\Master\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $kampus = \App\Models\Master\Institution::where('slug', 'polman-bandung')->first();
        $umkmOrg = Organization::where('slug', 'sikim')->first();

        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name' => 'Super Admin',
                'phone' => '081111111111',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
            ],
        );
        $superAdmin->assignRole('super_admin');

        if ($kampus) {
            $superAdmin->institutions()->syncWithoutDetaching([
                $kampus->id => [
                    'is_active' => true,
                    'joined_at' => now(),
                ],
            ]);
        }

        if ($umkmOrg) {
            $superAdmin->organizations()->syncWithoutDetaching([
                $umkmOrg->id => [
                    'is_active' => true,
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        $adminKampus = User::updateOrCreate(
            ['email' => 'admin.kampus@gmail.com'],
            [
                'name' => 'Admin Polman',
                'phone' => '082222222222',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
            ],
        );
        $adminKampus->assignRole('admin');

        if ($kampus) {
            $adminKampus->institutions()->sync([
                $kampus->id => [
                    'is_active' => true,
                    'joined_at' => now(),
                ],
            ]);
        }

        $adminUmkm = User::updateOrCreate(
            ['email' => 'upt@gmail.com'],
            [
                'name' => 'UPT SIKIM',
                'phone' => '082333333333',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
            ],
        );
        $adminUmkm->assignRole('upt');

        if ($umkmOrg) {
            $adminUmkm->organizations()->sync([
                $umkmOrg->id => [
                    'is_active' => true,
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        $advisor = User::updateOrCreate(
            ['email' => 'advisor@gmail.com'],
            [
                'name' => 'Advisor Kampus',
                'phone' => '083333333333',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
            ],
        );
        $advisor->assignRole('advisor');

        $syncOrgs = [];
        if ($kampus) {
            $syncOrgs[$kampus->id] = [
                'is_active' => true,
                'joined_at' => now(),
            ];
        }
        if (! empty($syncOrgs)) {
            $advisor->institutions()->sync($syncOrgs);
        }

        if ($umkmOrg) {
            $advisor->organizations()->sync([
                $umkmOrg->id => [
                    'is_active' => true,
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        $umkmOwner = User::updateOrCreate(
            ['email' => 'umkm@gmail.com'],
            [
                'name' => 'Owner Konveksi',
                'phone' => '085555555555',
                'is_active' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('password123'),
            ],
        );
        $umkmOwner->assignRole('umkm');

    }
}
