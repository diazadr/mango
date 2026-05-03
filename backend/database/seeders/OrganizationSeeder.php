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
        Organization::updateOrCreate(
            ['slug' => 'sikim'],
            [
                'name' => 'UPT Industri Logam',
                'email' => 'upt.logam@bandung.go.id',
                'phone' => '022-1234567',
                'address' => 'Jl. Industri No. 10, Bandung',
                'is_active' => true,
            ]
        );
    }
}
