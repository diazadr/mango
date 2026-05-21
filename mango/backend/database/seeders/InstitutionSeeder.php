<?php

namespace Database\Seeders;

use App\Models\Master\Institution;
use Illuminate\Database\Seeder;

class InstitutionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Institution::updateOrCreate(
            ['slug' => 'polman-bandung'],
            [
                'name' => 'Politeknik Manufaktur Bandung',
                'pic_name' => 'Tim MANGO Polman Bandung',
                'pic_phone' => '081122334455',
                'description' => 'Institusi pendidikan vokasi manufaktur yang membina ekosistem UMKM, laboratorium, dan layanan pendampingan industri melalui platform MANGO.',
                'email' => 'contact@polman-bandung.ac.id',
                'phone' => '022-2500935',
                'address' => 'Jl. Kanayakan No. 21',
                'province' => 'Jawa Barat',
                'regency' => 'Kota Bandung',
                'district' => 'Coblong',
                'village' => 'Dago',
                'postal_code' => '40135',
                'is_active' => true,
            ]
        );
    }
}
