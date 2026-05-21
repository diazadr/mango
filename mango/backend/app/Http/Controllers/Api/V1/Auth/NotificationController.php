<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class NotificationController extends Controller
{
    /**
     * @OA\Get(
     *     path="/v1/notifications",
     *     summary="Get all notifications for current user",
     *     tags={"Notifications"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="unread_only", in="query", @OA\Schema(type="boolean")),
     *
     *     @OA\Response(response=200, description="List of notifications")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $query = $request->boolean('unread_only')
                ? $user->unreadNotifications()
                : $user->notifications();

            $notifications = $query->paginate(20);

            return $this->ok($notifications, 'Pemberitahuan berhasil diambil.');
        } catch (Throwable $e) {
            Log::error('Notification index error', ['message' => $e->getMessage()]);

            return $this->error('Gagal mengambil pemberitahuan.', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/v1/notifications/{id}/read",
     *     summary="Mark a specific notification as read",
     *     tags={"Notifications"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string")),
     *
     *     @OA\Response(response=200, description="Marked as read")
     * )
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        try {
            $notification = $request->user()->notifications()->findOrFail($id);
            $notification->markAsRead();

            return $this->ok(null, 'Pemberitahuan ditandai sebagai terbaca.');
        } catch (Throwable $e) {
            Log::error('Notification read error', ['message' => $e->getMessage()]);

            return $this->error('Gagal memperbarui status pemberitahuan.', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/v1/notifications/read-all",
     *     summary="Mark all notifications as read",
     *     tags={"Notifications"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Response(response=200, description="All marked as read")
     * )
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $request->user()->unreadNotifications->markAsRead();

            return $this->ok(null, 'Semua pemberitahuan ditandai sebagai terbaca.');
        } catch (Throwable $e) {
            Log::error('Notification read all error', ['message' => $e->getMessage()]);

            return $this->error('Gagal memperbarui status semua pemberitahuan.', 500);
        }
    }
}
