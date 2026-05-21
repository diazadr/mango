<?php

namespace App\Http\Controllers\Api\V1\Admin\Master;

use App\Http\Controllers\Controller;
use App\Models\Edge\EdgeSite;
use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

/**
 * OverviewController
 *
 * Menyediakan statistik dashboard untuk SuperAdmin dan Admin Kampus.
 * Endpoint:
 *   GET /v1/admin/overview     → statistik UMKM, assessment, mentoring
 *   GET /v1/admin/edge/status  → status koneksi Edge Gateway
 */
class OverviewController extends Controller
{
    /**
     * GET /v1/admin/overview
     * Statistik platform untuk SuperAdmin dashboard.
     */
    public function index(): JsonResponse
    {
        // ── UMKM Stats ───────────────────────────────────────────────────────
        $totalUmkm   = Umkm::count();
        $activeUmkm  = Umkm::where('status', 'active')->count();
        $pendingUmkm = Umkm::where('status', 'pending')->count();

        // ── User Stats ───────────────────────────────────────────────────────
        $totalUsers   = User::count();
        $newUsersMonth = User::where('created_at', '>=', now()->startOfMonth())->count();

        // ── Assessment Stats ─────────────────────────────────────────────────
        $assessmentStats = DB::table('assessment_results')
            ->selectRaw('COUNT(*) as total, AVG(total_score) as avg_score')
            ->first();

        // ── Mentoring Stats ──────────────────────────────────────────────────
        $mentoringStats = DB::table('consultation_requests')
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed")
            ->first();

        // ── Reservation Stats ────────────────────────────────────────────────
        $reservationStats = DB::table('machine_reservations')
            ->selectRaw("COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed")
            ->first();

        // ── Article Stats ────────────────────────────────────────────────────
        $totalArticles = DB::table('articles')->count();

        // ── Edge Stats ───────────────────────────────────────────────────────
        $edgeSites = EdgeSite::count();
        $activeEdge = EdgeSite::where('is_active', true)->count();

        return response()->json([
            'data' => [
                'umkm' => [
                    'total'   => $totalUmkm,
                    'active'  => $activeUmkm,
                    'pending' => $pendingUmkm,
                ],
                'users' => [
                    'total'       => $totalUsers,
                    'new_this_month' => $newUsersMonth,
                ],
                'assessment' => [
                    'total'     => $assessmentStats?->total ?? 0,
                    'avg_score' => round($assessmentStats?->avg_score ?? 0, 1),
                ],
                'mentoring' => [
                    'total'     => $mentoringStats?->total ?? 0,
                    'completed' => $mentoringStats?->completed ?? 0,
                ],
                'reservation' => [
                    'total'     => $reservationStats?->total ?? 0,
                    'completed' => $reservationStats?->completed ?? 0,
                ],
                'articles' => [
                    'total' => $totalArticles,
                ],
                'edge' => [
                    'total_sites'  => $edgeSites,
                    'active_sites' => $activeEdge,
                ],
            ],
        ]);
    }

    /**
     * GET /v1/admin/edge/status
     * Status koneksi Edge Gateway — khusus admin kampus.
     * Melakukan ping ke Edge API untuk mendapatkan status real-time.
     */
    public function edgeStatus(): JsonResponse
    {
        $edgeSites = EdgeSite::where('is_active', true)->get();

        $results = $edgeSites->map(function (EdgeSite $site) {
            $edgeUrl = config('edge.base_url', 'http://localhost:8080');
            $status  = [
                'site_id'     => $site->site_id,
                'name'        => $site->name,
                'location'    => $site->location,
                'is_active'   => $site->is_active,
                'last_seen'   => $site->updated_at,
                'reachable'   => false,
                'connections' => null,
                'error'       => null,
            ];

            try {
                $response = Http::timeout(5)->get(
                    rtrim($edgeUrl, '/') . '/api/v1/status/connections'
                );
                if ($response->successful()) {
                    $status['reachable']   = true;
                    $status['connections'] = $response->json('connections');
                } else {
                    $status['error'] = 'HTTP ' . $response->status();
                }
            } catch (\Throwable $e) {
                $status['error'] = $e->getMessage();
            }

            return $status;
        });

        return response()->json([
            'data'       => $results,
            'total'      => $results->count(),
            'edge_api'   => config('edge.base_url', 'http://localhost:8080'),
            'checked_at' => now()->toISOString(),
        ]);
    }
}
