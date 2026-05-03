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
                'email' => 'contact@polman-bandung.ac.id',
                'phone' => '022-2500935',
                'address' => 'Jl. Kanayakan No. 21, Dago, Bandung',
                'is_active' => true,
            ]
        );

        Institution::updateOrCreate(
            ['slug' => 'itb'],
            [
                'name' => 'Institut Teknologi Bandung',
                'email' => 'contact@itb.ac.id',
                'phone' => '022-2500935',
                'address' => 'Jl. Ganesa No. 10, Bandung',
                'is_active' => true,
            ]
        );
    }
}
