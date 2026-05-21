<?php

namespace Database\Seeders;

use App\Models\Master\Department;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * UserSeeder — Data pengguna awal platform MANGO.
 *
 * Struktur Pengguna:
 * ─────────────────────────────────────────────────────────────────────────────
 *  Role          Email                              Keterangan
 * ─────────────────────────────────────────────────────────────────────────────
 *  super_admin   superadmin@gmail.com               Super Admin Sistem
 *  admin         mango@polman-bandung.ac.id          Admin Kampus (Polman Bandung)
 *  advisor       advisor.p3m@polman-bandung.ac.id    Advisor Dept. P3M
 *  advisor       advisor.inkubator@polman-bandung.ac.id  Advisor Dept. Inkubator Bisnis
 *  advisor       advisor.dpp@polman-bandung.ac.id    Advisor Dept. DPP Konsultasi
 *  advisor       advisor.pbl@polman-bandung.ac.id    Advisor Dept. PBL
 *  umkm          ptabacnc@gmail.com                  Pemilik UMKM (PT ABA CNC)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Catatan: Semua password default → password123
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Resolve master data ──────────────────────────────────────────────
        $polman  = Institution::where('slug', 'polman-bandung')->first();
        $sikim   = Organization::where('slug', 'sikim-bandung')->first();

        $deptP3m        = Department::where('slug', 'p3m')->first();
        $deptInkubator  = Department::where('slug', 'inkubator-bisnis')->first();
        $deptDpp        = Department::where('slug', 'dpp-konsultasi')->first();
        $deptPbl        = Department::where('slug', 'pbl')->first();

        // ════════════════════════════════════════════════════════════════════
        // 1. SUPER ADMIN
        // ════════════════════════════════════════════════════════════════════
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@gmail.com'],
            [
                'name'               => 'Super Admin',
                'phone'              => '081111111111',
                'nik'                => '3273111111111111',
                'dob'                => '1980-01-01',
                'is_active'          => true,
                'email_verified_at'  => now(),
                'password'           => Hash::make('password123'),
            ]
        );
        $superAdmin->syncRoles(['super_admin']);

        if ($polman) {
            $superAdmin->institutions()->syncWithoutDetaching([
                $polman->id => ['is_active' => true, 'joined_at' => now()],
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 2. ADMIN KAMPUS — Politeknik Manufaktur Bandung
        // ════════════════════════════════════════════════════════════════════
        $adminKampus = User::updateOrCreate(
            ['email' => 'mango@polman-bandung.ac.id'],
            [
                'name'               => 'Polman Bandung',
                'phone'              => '082222222222',
                'nik'                => '3273222222222222',
                'dob'                => '1985-02-02',
                'is_active'          => true,
                'email_verified_at'  => now(),
                'password'           => Hash::make('password123'),
            ]
        );
        $adminKampus->syncRoles(['admin']);

        if ($polman) {
            $adminKampus->institutions()->sync([
                $polman->id => ['is_active' => true, 'joined_at' => now()],
            ]);
        }

        // ════════════════════════════════════════════════════════════════════
        // 4. ADVISOR — Satu advisor per departemen
        // ════════════════════════════════════════════════════════════════════
        $advisors = [
            [
                'email'   => 'advisor.p3m@polman-bandung.ac.id',
                'name'    => 'Advisor P3M',
                'phone'   => '083111111111',
                'nik'     => '3273333333333331',
                'dob'     => '1990-03-01',
                'dept'    => $deptP3m,
                'label'   => 'Advisor P3M',
            ],
            [
                'email'   => 'advisor.inkubator@polman-bandung.ac.id',
                'name'    => 'Advisor Inkubator Bisnis',
                'phone'   => '083222222222',
                'nik'     => '3273333333333332',
                'dob'     => '1990-03-02',
                'dept'    => $deptInkubator,
                'label'   => 'Advisor Inkubator Bisnis',
            ],
            [
                'email'   => 'advisor.dpp@polman-bandung.ac.id',
                'name'    => 'Advisor DPP Konsultasi',
                'phone'   => '083333333333',
                'nik'     => '3273333333333333',
                'dob'     => '1990-03-03',
                'dept'    => $deptDpp,
                'label'   => 'Advisor DPP Konsultasi',
            ],
            [
                'email'   => 'advisor.pbl@polman-bandung.ac.id',
                'name'    => 'Advisor PBL',
                'phone'   => '083444444444',
                'nik'     => '3273333333333334  ',
                'dob'     => '1990-03-04',
                'dept'    => $deptPbl,
                'label'   => 'Advisor PBL',
            ],
        ];

        foreach ($advisors as $data) {
            $advisor = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'               => $data['name'],
                    'phone'              => $data['phone'],
                    'nik'                => $data['nik'],
                    'dob'                => $data['dob'],
                    'is_active'          => true,
                    'email_verified_at'  => now(),
                    'password'           => Hash::make('password123'),
                ]
            );
            $advisor->syncRoles(['advisor']);

            // Lampirkan advisor ke institusi dengan departemennya
            if ($polman) {
                $advisor->institutions()->syncWithoutDetaching([
                    $polman->id => [
                        'is_active'     => true,
                        'joined_at'     => now(),
                        'department_id' => $data['dept']?->id,
                    ],
                ]);
            }

            $this->command->info("  ✓ {$data['label']}: {$data['name']} ({$data['email']})");
        }

        // ════════════════════════════════════════════════════════════════════
        // 5. UMKM OWNER — Pemilik usaha
        // ════════════════════════════════════════════════════════════════════
        $umkmOwner = User::updateOrCreate(
            ['email' => 'ptabacnc@gmail.com'],
            [
                'name'               => 'Direktur PT ABA',
                'phone'              => '085555555555',
                'nik'                => '3273555555555555',
                'dob'                => '1982-10-10',
                'is_active'          => true,
                'email_verified_at'  => now(),
                'password'           => Hash::make('password123'),
            ]
        );
        $umkmOwner->syncRoles(['umkm']);

        // ════════════════════════════════════════════════════════════════════
        // 6. UPT PENGELOLA — Pengelola SIKIM
        // ════════════════════════════════════════════════════════════════════
        $uptSikim = User::updateOrCreate(
            ['email' => 'upt.sikim@gmail.com'],
            [
                'name'               => 'Koordinator SIKIM Bandung',
                'phone'              => '081234560001',
                'nik'                => '3273666666666666',
                'dob'                => '1985-05-05',
                'is_active'          => true,
                'email_verified_at'  => now(),
                'password'           => Hash::make('password123'),
            ]
        );
        $uptSikim->syncRoles(['upt']);

        if ($sikim) {
            $uptSikim->organizations()->syncWithoutDetaching([
                $sikim->id => ['is_active' => true, 'joined_at' => now()],
            ]);
        }

        // ── Summary ──────────────────────────────────────────────────────────
        $this->command->newLine();
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->info(' UserSeeder selesai. Daftar akun aktif:');
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->table(
            ['Role', 'Nama', 'Email', 'Password'],
            [
                ['super_admin', 'Super Admin',                       'superadmin@gmail.com',                      'password123'],
                ['admin',       'Polman Bandung',                    'mango@polman-bandung.ac.id',                'password123'],
                ['advisor',     'Advisor (P3M)',          'advisor.p3m@polman-bandung.ac.id',          'password123'],
                ['advisor',     'Advisor (Inkubator)',      'advisor.inkubator@polman-bandung.ac.id',    'password123'],
                ['advisor',     'Advisor (DPP)',        'advisor.dpp@polman-bandung.ac.id',          'password123'],
                ['advisor',     'Advisor (PBL)',              'advisor.pbl@polman-bandung.ac.id',          'password123'],
                ['umkm',        'Direktur PT ABA',                  'ptabacnc@gmail.com',                        'password123'],
                ['upt',         'Koordinator SIKIM',                'upt.sikim@mango.test',                      'password123'],
            ]
        );
    }
}
