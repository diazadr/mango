<?php

namespace Database\Seeders;

use App\Models\Assessment\AssessmentCategory;
use App\Models\Assessment\Question;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            'manajemen' => [
                'Apakah usaha Anda sudah memiliki legalitas lengkap (NIB, Izin Edar, Izin Khusus)?',
                'Apakah terdapat struktur organisasi dan pembagian tugas (job desk) yang jelas?',
                'Apakah sudah ada SOP (Standard Operating Procedure) untuk seluruh operasional rutin?',
                'Apakah Anda memiliki rencana bisnis (business plan) dan target target jangka menengah?',
                'Sejauh mana manajemen risiko dan sistem penanganan masalah diterapkan di perusahaan?',
            ],
            'produksi' => [
                'Apakah proses produksi Anda sudah memiliki alur standar dan rekayasa produk yang tetap?',
                'Apakah dilakukan pemeliharaan (maintenance) rutin dan terencana pada mesin/peralatan?',
                'Bagaimana efektivitas manajemen persediaan bahan baku dan rantai pasok (supply chain)?',
                'Sejauh mana tingkat otomasi atau penggunaan teknologi mekanik pada lini produksi Anda?',
                'Apakah terdapat sistem pengendalian kualitas (QC) dan penanganan produk gagal yang ketat?',
                'Apakah standar Kesehatan dan Keselamatan Kerja (K3) sudah diterapkan di area produksi?',
            ],
            'pemasaran' => [
                'Sejauh mana efektivitas penggunaan platform digital (Marketplace, Medsos, Web) untuk pemasaran?',
                'Apakah produk Anda memiliki identitas brand, kemasan, dan nilai jual yang kompetitif?',
                'Apakah Anda melakukan analisis pasar dan kompetitor secara berkala untuk inovasi?',
                'Apakah terdapat sistem manajemen pelanggan (CRM) dan penanganan keluhan pembeli?',
                'Seberapa luas jangkauan distribusi produk Anda (Lokal, Nasional, atau Ekspor)?',
            ],
            'keuangan' => [
                'Apakah dilakukan pencatatan keuangan harian dan penyusunan laporan laba-rugi rutin?',
                'Apakah keuangan usaha sudah terpisah sepenuhnya dari keuangan pribadi pemilik?',
                'Apakah terdapat manajemen arus kas (cash flow) dan penganggaran (budgeting) tahunan?',
                'Sejauh mana kepatuhan usaha terhadap kewajiban perpajakan (NPWP dan lapor pajak)?',
                'Apakah usaha Anda memiliki akses dan rekam jejak yang baik dengan lembaga keuangan formal?',
            ],
            'teknologi' => [
                'Bagaimana kondisi fisik, umur ekonomis, dan keandalan alat/mesin produksi utama Anda?',
                'Apakah Anda menggunakan software pendukung (POS, Inventory, atau ERP) untuk operasional?',
                'Sejauh mana keamanan data bisnis dan perlindungan informasi perusahaan dikelola?',
                'Apakah tersedia infrastruktur IT (Internet/Hardware) yang memadai untuk operasional harian?',
                'Apakah terdapat pemanfaatan teknologi digital untuk monitoring performa bisnis real-time?',
            ],
            'sdm' => [
                'Apakah karyawan memiliki keterampilan teknis yang sesuai dengan standar kebutuhan industri?',
                'Apakah perusahaan menyediakan program pelatihan dan pengembangan kompetensi berkala?',
                'Bagaimana kualitas kepemimpinan dan budaya kerja inovatif di lingkungan perusahaan?',
                'Apakah sudah terdapat sistem penggajian (remunerasi) dan motivasi kerja yang terstandar?',
                'Sejauh mana tingkat literasi dan kemahiran digital seluruh anggota tim Anda?',
            ],
        ];

        foreach ($data as $slug => $questions) {
            $category = AssessmentCategory::where('slug', $slug)->first();
            if ($category) {
                foreach ($questions as $index => $text) {
                    Question::updateOrCreate(
                        [
                            'assessment_category_id' => $category->id,
                            'text' => $text,
                        ],
                        [
                            'type' => 'scale',
                            'weight' => 1.0,
                            'order' => $index + 1,
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
