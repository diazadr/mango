<?php

namespace Database\Seeders;

use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UmkmSeeder extends Seeder
{
    public function run(): void
    {
        $org = Organization::where('slug', 'sikim')->first();
        $user = User::where('email', 'umkm@gmail.com')->first();

        if (! $org || ! $user) {
            return;
        }

        Umkm::updateOrCreate(
            ['user_id' => $user->id],
            [
                'uuid' => (string) Str::uuid(),
                'organization_id' => $org->id,
                'registration_number' => 'MANGO-2026-0001',
                'name' => 'Konveksi Jaya',
                'slug' => Str::slug('Konveksi Jaya').'-'.Str::lower(Str::random(6)),
                'email' => 'konveksijaya@gmail.com',
                'phone' => '08123456789',
                'address' => 'Jl. Industri No. 1, Bandung',
                'sector' => 'Fashion',
                'nib' => '1234567890123',
                'employee_count' => 8,
                'established_year' => 2020,
                'is_active' => true,
                'status' => 'approved',
            ]
        );
    }
}
