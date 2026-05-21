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
        $org = Organization::where('slug', 'sikim-bandung')->first();
        $user = User::where('email', 'ptabacnc@gmail.com')->first();

        if (! $org || ! $user) {
            return;
        }

        Umkm::updateOrCreate(
            ['user_id' => $user->id],
            [
                'uuid' => (string) Str::uuid(),
                'organization_id' => $org->id,
                'registration_number' => 'MANGO-2026-0001',
                'name' => 'PT ABA CNC Indonesia',
                'slug' => Str::slug('PT ABA CNC Indonesia').'-'.Str::lower(Str::random(6)),
                'description' => 'UMKM manufaktur presisi yang bergerak di bidang machining, pembuatan jig fixture, dan komponen teknik untuk industri otomotif serta general engineering.',
                'email' => 'ptabacnc@gmail.com',
                'phone' => '085555555555',
                'address' => 'Jl. Raya Batujajar No. 77',
                'province' => 'Jawa Barat',
                'regency' => 'Kabupaten Bandung Barat',
                'district' => 'Batujajar',
                'village' => 'Giriasih',
                'postal_code' => '40561',
                'latitude' => -6.91234567,
                'longitude' => 107.45876543,
                'sector' => 'Manufaktur Presisi',
                'nib' => '1234567890123',
                'legal_entity_type' => 'PT',
                'website' => 'https://abacnc.example.com',
                'employee_count' => 18,
                'established_year' => 2018,
                'main_product' => 'Komponen Mesin, Jig & Fixture, Mold Maker',
                'market_target' => 'B2B - Manufaktur Otomotif & General Engineering',
                'operating_hours' => [
                    'monday' => ['open' => '08:00', 'close' => '17:00', 'closed' => false],
                    'tuesday' => ['open' => '08:00', 'close' => '17:00', 'closed' => false],
                    'wednesday' => ['open' => '08:00', 'close' => '17:00', 'closed' => false],
                    'thursday' => ['open' => '08:00', 'close' => '17:00', 'closed' => false],
                    'friday' => ['open' => '08:00', 'close' => '16:30', 'closed' => false],
                    'saturday' => ['open' => '08:00', 'close' => '12:00', 'closed' => false],
                    'sunday' => ['closed' => true],
                ],
                'is_active' => true,
                'status' => 'approved',
            ]
        );
    }
}
