<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Activitylog\Models\Activity;
use Throwable;

class AccountSecurityController extends Controller
{
    /**
     * Get recent activity logs for the user.
     */
    public function getActivityLog(Request $request): JsonResponse
    {
        try {
            $activities = Activity::where('causer_id', $request->user()->id)
                ->where('causer_type', get_class($request->user()))
                ->latest()
                ->limit(10)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'description' => $activity->description,
                        'subject_type' => $activity->subject_type,
                        'properties' => $activity->properties,
                        'created_at' => $activity->created_at->toISOString(),
                        'ip_address' => $activity->properties['ip'] ?? null,
                    ];
                });

            return response()->json([
                'data' => $activities
            ]);
        } catch (Throwable $e) {
            Log::error('Security activity log error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengambil log aktivitas.'], 500);
        }
    }

    /**
     * Get active sessions for the user.
     */
    public function getSessions(Request $request): JsonResponse
    {
        try {
            $sessions = DB::table('sessions')
                ->where('user_id', $request->user()->id)
                ->orderBy('last_activity', 'desc')
                ->get()
                ->map(function ($session) {
                    $agent = $this->parseUserAgent($session->user_agent);
                    return [
                        'id' => $session->id,
                        'ip_address' => $session->ip_address,
                        'is_current_device' => $session->id === session()->getId(),
                        'browser' => $agent['browser'],
                        'platform' => $agent['platform'],
                        'last_active' => date('Y-m-d H:i:s', $session->last_activity),
                    ];
                });

            return response()->json([
                'data' => $sessions
            ]);
        } catch (Throwable $e) {
            Log::error('Security sessions error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengambil sesi aktif.'], 500);
        }
    }

    /**
     * Logout a specific session.
     */
    public function logoutSession(Request $request, string $sessionId): JsonResponse
    {
        try {
            DB::table('sessions')
                ->where('id', $sessionId)
                ->where('user_id', $request->user()->id)
                ->delete();

            return response()->json([
                'message' => 'Sesi berhasil dihentikan.'
            ]);
        } catch (Throwable $e) {
            Log::error('Security session delete error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menghentikan sesi.'], 500);
        }
    }

    /**
     * Get notification settings.
     */
    public function getNotificationSettings(Request $request): JsonResponse
    {
        $settings = $request->user()->settings ?? [
            'email_assessment' => true,
            'email_mentoring' => true,
            'email_system' => true,
        ];

        return response()->json([
            'data' => $settings
        ]);
    }

    /**
     * Update notification settings.
     */
    public function updateNotificationSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email_assessment' => 'boolean',
            'email_mentoring' => 'boolean',
            'email_system' => 'boolean',
        ]);

        $user = $request->user();
        $user->settings = array_merge($user->settings ?? [], $validated);
        $user->save();

        return response()->json([
            'message' => 'Pengaturan notifikasi diperbarui.',
            'data' => $user->settings
        ]);
    }

    /**
     * Logout from all other browser sessions.
     */
    public function logoutOtherSessions(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        try {
            auth()->guard('web')->logoutOtherDevices($request->password);

            return response()->json([
                'message' => 'Berhasil keluar dari semua perangkat lain.'
            ]);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Kata sandi tidak valid.'], 422);
        }
    }

    /**
     * Permanently delete the user's account.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! \Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Kata sandi tidak valid.'], 422);
        }

        try {
            DB::transaction(function () use ($user) {
                // Delete UMKM if exists
                if ($user->umkm) {
                    $user->umkm->delete();
                }
                
                $user->delete();
            });

            auth()->guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Akun Anda berhasil dihapus secara permanen.'
            ]);
        } catch (Throwable $e) {
            Log::error('Account deletion error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menghapus akun.'], 500);
        }
    }

    /**
     * Minimal user agent parser.
     */
    private function parseUserAgent($userAgent)
    {
        $browser = "Unknown Browser";
        $platform = "Unknown OS";

        if (preg_match('/linux/i', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $platform = 'Mac OS';
        } elseif (preg_match('/windows|win32/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/iphone/i', $userAgent)) {
            $platform = 'iPhone';
        } elseif (preg_match('/android/i', $userAgent)) {
            $platform = 'Android';
        }

        if (preg_match('/MSIE/i', $userAgent) && !preg_match('/Opera/i', $userAgent)) {
            $browser = 'Internet Explorer';
        } elseif (preg_match('/Firefox/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/Safari/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/Opera/i', $userAgent)) {
            $browser = 'Opera';
        } elseif (preg_match('/Netscape/i', $userAgent)) {
            $browser = 'Netscape';
        }

        return ['browser' => $browser, 'platform' => $platform];
    }
}
