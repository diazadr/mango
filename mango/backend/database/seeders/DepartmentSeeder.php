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
            [
                'name' => 'P3M',
                'description' => 'Penelitian dan Pengabdian Masyarakat',
                'email' => 'p3m@polman-bandung.ac.id',
                'phone' => '022-2500935 ext 101',
                'head_name' => 'Kepala P3M',
                'location' => 'Gedung Direktorat Lantai 2',
            ],
            [
                'name' => 'Inkubator Bisnis',
                'description' => 'Kealumnian dan Inkubator',
                'email' => 'inkubator@polman-bandung.ac.id',
                'phone' => '022-2500935 ext 202',
                'head_name' => 'Koordinator Inkubator Bisnis',
                'location' => 'Business Development Center',
            ],
            [
                'name' => 'DPP Konsultasi',
                'description' => 'Divisi Pengembangan Produk',
                'email' => 'dpp.konsultasi@polman-bandung.ac.id',
                'phone' => '022-2500935 ext 303',
                'head_name' => 'Kepala DPP Konsultasi',
                'location' => 'Workshop Produk Presisi',
            ],
            [
                'name' => 'PBL',
                'description' => 'Project Based Learning Mahasiswa',
                'email' => 'pbl@polman-bandung.ac.id',
                'phone' => '022-2500935 ext 404',
                'head_name' => 'Koordinator PBL',
                'location' => 'Learning Factory Area',
            ],
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
                    'email' => $dept['email'],
                    'phone' => $dept['phone'],
                    'head_name' => $dept['head_name'],
                    'location' => $dept['location'],
                    'is_active' => true,
                ]
            );
        }
    }
}
