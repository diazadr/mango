<?php

namespace Database\Seeders;

use App\Models\Master\Department;
use App\Models\Master\Institution;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $institution = Institution::first();

        if (! $institution) {
            return;
        }

        $departments = [
            ['name' => 'P3M', 'description' => 'Penelitian dan Pengabdian Masyarakat'],
            ['name' => 'Inkubator Bisnis', 'description' => 'Kealumnian dan Inkubator'],
            ['name' => 'DPP Konsultasi', 'description' => 'Divisi Pengembangan Produk'],
            ['name' => 'PBL', 'description' => 'Project Based Learning Mahasiswa'],
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(
                [
                    'institution_id' => $institution->id,
                    'slug' => Str::slug($dept['name']),
                ],
                [
                    'name' => $dept['name'],
                    'description' => $dept['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}
