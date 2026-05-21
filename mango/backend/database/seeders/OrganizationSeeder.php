<?php

namespace Database\Seeders;

use App\Models\Master\Organization;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $organizations = [
            [
                'slug' => 'sikim-bandung',
                'name' => 'SIKIM Bandung',
                'pic_name' => 'Koordinator SIKIM Bandung',
                'pic_phone' => '081234560001',
                'email' => 'sikim.bandung@mango.test',
                'phone' => '022-87654321',
                'address' => 'Jl. Soekarno Hatta No. 512',
                'province' => 'Jawa Barat',
                'regency' => 'Kota Bandung',
                'district' => 'Buahbatu',
                'village' => 'Sekejati',
                'postal_code' => '40286',
                'description' => 'Komunitas dan organisasi binaan untuk pelaku IKM manufaktur kecil menengah di wilayah Bandung Raya.',
                'is_active' => true,
            ]
        ];

        foreach ($organizations as $organization) {
            Organization::updateOrCreate(
                ['slug' => $organization['slug']],
                $organization
            );
        }
    }
}
