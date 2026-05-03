<?php

namespace App\Services\Umkm\Strategy;

use App\Models\Assessment\Answer;
use App\Models\Assessment\AssessmentCategory;
use App\Models\Assessment\AssessmentResult;
use App\Models\Assessment\Recommendation;
use Illuminate\Support\Facades\DB;

class AssessmentService
{
    protected const WEIGHTS = [
        'manajemen' => 0.15,
        'produksi' => 0.25,
        'pemasaran' => 0.15,
        'keuangan' => 0.15,
        'teknologi' => 0.20,
        'sdm' => 0.10,
    ];

    protected const LEVELS = [
        ['max' => 1.8, 'level' => 'Level 1', 'category' => 'Usaha Dasar'],
        ['max' => 2.6, 'level' => 'Level 2', 'category' => 'Mulai Terorganisir'],
        ['max' => 3.4, 'level' => 'Level 3', 'category' => 'Berkembang'],
        ['max' => 4.2, 'level' => 'Level 4', 'category' => 'Maju'],
        ['max' => 5.0, 'level' => 'Level 5', 'category' => 'Siap Ekspansi'],
    ];

    public function getQuestions()
    {
        return AssessmentCategory::query()
            ->where('is_active', true)
            ->with([
                'questions' => function ($query) {
                    $query
                        ->where('is_active', true)
                        ->orderBy('order');
                },
            ])
            ->orderBy('order')
            ->get();
    }

    public function getAssessments(array $filters, $user)
    {
        $query = AssessmentResult::query()
            ->with([
                'recommendations',
                'recommendations.category',
                'umkm',
                'answers.question.category',
            ]);

        if (! $user->hasRole('super_admin')) {
            $umkm = $user->umkm;

            if (! $umkm) {
                return collect([]);
            }

            $query->where('umkm_id', $umkm->id);
        } elseif (isset($filters['umkm_id'])) {
            $query->where('umkm_id', $filters['umkm_id']);
        }

        if (isset($filters['from_date'])) {
            $query->whereDate(
                'created_at',
                '>=',
                $filters['from_date']
            );
        }

        if (isset($filters['to_date'])) {
            $query->whereDate(
                'created_at',
                '<=',
                $filters['to_date']
            );
        }

        if (isset($filters['status'])) {
            $query->where(
                'status',
                $filters['status']
            );
        }

        $query->orderBy(
            $filters['sort_by'] ?? 'created_at',
            $filters['sort_dir'] ?? 'desc'
        );

        return $query->paginate(
            min((int) ($filters['per_page'] ?? 15), 100)
        );
    }

    public function getOrCreateDraft(
        int $umkmId,
        int $userId
    ): AssessmentResult {
        // 1. Check for existing draft
        $assessment = AssessmentResult::query()
            ->where('umkm_id', $umkmId)
            ->where('user_id', $userId)
            ->where('status', 'draft')
            ->first();

        if ($assessment) {
            $assessment->load('answers');

            return $assessment;
        }

        // 2. Check last submitted assessment for 30-day limit
        $lastSubmitted = AssessmentResult::query()
            ->where('umkm_id', $umkmId)
            ->where('status', 'submitted')
            ->latest('submitted_at')
            ->first();

        if ($lastSubmitted && now()->diffInDays($lastSubmitted->submitted_at) < 30) {
            return $lastSubmitted; // Return the last one to show status on frontend
        }

        return AssessmentResult::create([
            'umkm_id' => $umkmId,
            'user_id' => $userId,
            'status' => 'draft',
            'level' => 'Level 1',
        ]);
    }

    public function submitAnswers(
        AssessmentResult $assessment,
        array $answers
    ): void {
        DB::transaction(function () use (
            $assessment,
            $answers
        ) {
            foreach ($answers as $answer) {
                Answer::updateOrCreate(
                    [
                        'assessment_result_id' => $assessment->id,
                        'question_id' => $answer['question_id'],
                    ],
                    [
                        'value' => $answer['value'],
                        'score' => $answer['score'],
                    ]
                );
            }
        });
    }

    public function process(
        AssessmentResult $result
    ): AssessmentResult {
        return DB::transaction(function () use ($result) {
            $categoryScores = $this->calculateCategoryScores($result);

            $totalScore = $this->calculateTotalScore(
                $categoryScores
            );

            $level = $this->determineLevel($totalScore);

            $result->update([
                'total_score' => $totalScore,
                'level' => $level,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            $this->generateRecommendations(
                $result,
                $categoryScores
            );

            return $result->fresh([
                'recommendations',
            ]);
        });
    }

    public function getChartData(
        AssessmentResult $result
    ): array {
        $scores = $this->calculateCategoryScores($result);
        $data = [];

        $categories = AssessmentCategory::query()
            ->where('is_active', true)
            ->get();

        foreach ($categories as $category) {
            $data[] = [
                'subject' => $category->name,
                'score' => (float) ($scores[$category->slug]['avg'] ?? 0),
                'fullMark' => 5,
            ];
        }

        return $data;
    }

    public function calculateCategoryScores(
        AssessmentResult $result
    ): array {
        $scores = [];

        $categories = AssessmentCategory::query()
            ->where('is_active', true)
            ->get();

        foreach ($categories as $category) {
            $avgScore = Answer::query()
                ->where(
                    'assessment_result_id',
                    $result->id
                )
                ->whereHas(
                    'question',
                    function ($query) use ($category) {
                        $query->where(
                            'assessment_category_id',
                            $category->id
                        );
                    }
                )
                ->avg('score');

            $scores[$category->slug] = [
                'id' => $category->id,
                'avg' => (float) ($avgScore ?? 0),
            ];
        }

        return $scores;
    }

    protected function calculateTotalScore(
        array $categoryScores
    ): float {
        $totalScore = 0;

        foreach (self::WEIGHTS as $slug => $weight) {
            $avg = $categoryScores[$slug]['avg'] ?? 0;

            $totalScore += $avg * $weight;
        }

        return (float) $totalScore;
    }

    protected function determineLevel(
        float $totalScore
    ): string {
        foreach (self::LEVELS as $range) {
            if ($totalScore <= $range['max']) {
                return $range['level'];
            }
        }

        return 'Level 5';
    }

    protected function generateRecommendations(
        AssessmentResult $result,
        array $categoryScores
    ): void {
        $result->recommendations()->delete();

        foreach ($categoryScores as $slug => $data) {
            $avg = $data['avg'];

            $gapScore = 5.0 - $avg;

            if ($gapScore <= 0) {
                continue;
            }

            Recommendation::create([
                'assessment_result_id' => $result->id,
                'assessment_category_id' => $data['id'],
                'gap_score' => $gapScore,
                'priority' => $this->determinePriority($gapScore),
                'recommendation_text' => $this->getRecommendationText(
                    $slug,
                    $result->level,
                    $this->determinePriority($gapScore)
                ),
            ]);
        }
    }

    protected function determinePriority(
        float $gapScore
    ): string {
        if ($gapScore > 2) {
            return 'high';
        }

        if ($gapScore > 1) {
            return 'medium';
        }

        return 'low';
    }

    protected function getRecommendationText(
        string $slug,
        string $level,
        string $priority
    ): string {
        $interventions = [
            'Level 1' => [
                'manajemen' => 'Segera lengkapi legalitas dasar (NIB melalui OSS RBA) dan susun struktur organisasi sederhana untuk memperjelas tanggung jawab.',
                'produksi' => 'Mulai mendokumentasikan alur proses produksi secara manual untuk menciptakan standarisasi awal.',
                'pemasaran' => 'Buat profil bisnis digital sederhana (Google Maps/WhatsApp Business) untuk membangun kehadiran online dasar.',
                'keuangan' => 'Lakukan pemisahan rekening bank pribadi dan usaha, serta catat pemasukan/pengeluaran harian menggunakan buku kas sederhana.',
                'teknologi' => 'Identifikasi kebutuhan alat produksi utama dan pastikan konektivitas internet dasar tersedia untuk komunikasi bisnis.',
                'sdm' => 'Lakukan identifikasi keahlian yang dibutuhkan dan berikan instruksi kerja tertulis sederhana kepada tenaga kerja.',
            ],
            'Level 2' => [
                'manajemen' => 'Susun SOP (Standard Operating Procedure) untuk aktivitas kunci dan buat perencanaan bisnis sederhana untuk 1 tahun ke depan.',
                'produksi' => 'Terapkan pemeliharaan mesin secara berkala (preventive maintenance) dan mulai mengontrol kualitas bahan baku yang masuk.',
                'pemasaran' => 'Aktifkan media sosial (Instagram/Facebook) secara konsisten dan perbaiki identitas visual (logo & kemasan) produk.',
                'keuangan' => 'Gunakan aplikasi pencatatan keuangan digital (seperti BukuWarung/Moka) untuk menghasilkan laporan laba-rugi bulanan.',
                'teknologi' => 'Adopsi software Point of Sale (POS) untuk transaksi dan pastikan perangkat keras (laptop/HP) mendukung operasional.',
                'sdm' => 'Berikan pelatihan teknis dasar kepada karyawan dan mulai terapkan sistem absensi serta evaluasi kinerja sederhana.',
            ],
            'Level 3' => [
                'manajemen' => 'Lengkapi sertifikasi produk (Halal/BPOM/SNI) dan terapkan sistem manajemen risiko operasional secara formal.',
                'produksi' => 'Implementasikan kontrol kualitas (QC) di setiap tahapan produksi dan optimalkan manajemen stok bahan baku (Inventory Management).',
                'pemasaran' => 'Gunakan Marketplace (Shopee/Tokopedia) secara profesional dan mulai lakukan analisis kompetitor serta tren pasar secara rutin.',
                'keuangan' => 'Susun anggaran tahunan (budgeting) dan monitor arus kas (cash flow) secara ketat untuk perencanaan investasi alat.',
                'teknologi' => 'Gunakan sistem penyimpanan data berbasis Cloud dan mulai integrasikan data penjualan dengan data persediaan.',
                'sdm' => 'Terapkan sistem remunerasi berbasis kinerja (KPI) dan rutin lakukan workshop pengembangan kompetensi digital bagi tim.',
            ],
            'Level 4' => [
                'manajemen' => 'Lakukan audit internal secara berkala dan kembangkan kemitraan strategis dengan institusi atau industri besar.',
                'produksi' => 'Adopsi teknologi semi-otomatis atau sensor pada lini produksi untuk meningkatkan efisiensi dan akurasi data produksi.',
                'pemasaran' => 'Gunakan iklan berbayar (Ads) secara terukur dan mulai kembangkan strategi distribusi nasional atau persiapan ekspor.',
                'keuangan' => 'Gunakan software akuntansi profesional dan siapkan laporan keuangan yang layak audit (bankable) untuk akses modal besar.',
                'teknologi' => 'Implementasikan sistem Dashboard Monitoring Real-time untuk memantau performa bisnis di berbagai divisi.',
                'sdm' => 'Bangun budaya kerja inovatif dengan reward system bagi ide perbaikan proses dan pastikan literasi digital tim di level mahir.',
            ],
            'Level 5' => [
                'manajemen' => 'Kembangkan model bisnis waralaba (franchise) atau lisensi, serta fokus pada keberlanjutan (sustainability) dan skalabilitas global.',
                'produksi' => 'Integrasikan sistem produksi dengan IoT (Internet of Things) untuk otomasi penuh dan efisiensi energi yang optimal.',
                'pemasaran' => 'Lakukan ekspansi ke pasar internasional secara masif dan bangun loyalitas pelanggan melalui sistem CRM yang terintegrasi.',
                'keuangan' => 'Lakukan analisis keuangan strategis untuk merger, akuisisi, atau persiapan penawaran saham ke publik (IPO).',
                'teknologi' => 'Gunakan analisis Big Data dan AI untuk prediksi permintaan pasar serta optimasi rantai pasok secara cerdas.',
                'sdm' => 'Jadilah pusat pembelajaran (Center of Excellence) di industri Anda dan kembangkan talenta kepemimpinan kelas dunia.',
            ],
        ];

        return $interventions[$level][$slug]
            ?? "Optimalkan pilar {$slug} dengan mengacu pada standar INDI 4.0 untuk mencapai level kematangan selanjutnya.";
    }
}
