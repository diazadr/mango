<?php

namespace Database\Seeders;

use App\Models\Assessment\AssessmentCategory;
use Illuminate\Database\Seeder;

class AssessmentCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Manajemen Usaha',
                'slug' => 'manajemen',
                'description' => 'Legalitas, struktur organisasi, perencanaan, dan SOP.',
                'weight' => 0.15,
                'order' => 1,
            ],
            [
                'name' => 'Sistem Produksi',
                'slug' => 'produksi',
                'description' => 'Standarisasi proses, otomasi, pengendalian kualitas, dan efisiensi.',
                'weight' => 0.25,
                'order' => 2,
            ],
            [
                'name' => 'Pemasaran & Penjualan',
                'slug' => 'pemasaran',
                'description' => 'Jangkauan pasar, distribusi, branding, dan pemasaran digital.',
                'weight' => 0.15,
                'order' => 3,
            ],
            [
                'name' => 'Keuangan',
                'slug' => 'keuangan',
                'description' => 'Pencatatan keuangan, manajemen arus kas, dan akses permodalan.',
                'weight' => 0.15,
                'order' => 4,
            ],
            [
                'name' => 'Teknologi & Peralatan',
                'slug' => 'teknologi',
                'description' => 'Kondisi peralatan, digitalisasi operasional, dan literasi digital.',
                'weight' => 0.20,
                'order' => 5,
            ],
            [
                'name' => 'SDM & Kapasitas',
                'slug' => 'sdm',
                'description' => 'Keterampilan teknis, pelatihan, kompetensi manajerial, dan budaya kerja.',
                'weight' => 0.10,
                'order' => 6,
            ],
        ];

        foreach ($categories as $category) {
            AssessmentCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
