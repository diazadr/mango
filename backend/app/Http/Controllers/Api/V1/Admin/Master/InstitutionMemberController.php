<?php

namespace App\Http\Controllers\Api\V1\Admin\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Institution;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class InstitutionMemberController extends Controller
{
    /**
     * List institution members.
     */
    public function index(Request $request, Institution $institution): JsonResponse
    {
        $this->authorize('view', $institution);

        try {
            $query = $institution->belongsToMany(User::class, 'institution_user', 'institution_id', 'user_id')
                ->withPivot(['id', 'is_active', 'joined_at', 'department_id'])
                ->with('roles');

            if (! is_null($request->get('is_active'))) {
                $query->wherePivot('is_active', $request->boolean('is_active'));
            }

            $sortBy = $request->get('sort_by', 'users.created_at');
            $sortDir = $request->get('sort_dir', 'desc');

            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return response()->json($query->paginate($perPage));
        } catch (Throwable $e) {
            Log::error('Institution member index error', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal mengambil data anggota institusi.'], 500);
        }
    }

    /**
     * Update member status.
     */
    public function updateStatus(Request $request, Institution $institution, User $user): JsonResponse
    {
        $this->authorize('update', $institution);

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        try {
            $institution->belongsToMany(User::class, 'institution_user', 'institution_id', 'user_id')
                ->updateExistingPivot($user->id, [
                    'is_active' => $validated['is_active'],
                ]);

            return response()->json(['message' => 'Status anggota berhasil diperbarui.']);
        } catch (Throwable $e) {
            Log::error('Institution member update error', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal memperbarui status anggota.'], 500);
        }
    }

    /**
     * Remove member from institution.
     */
    public function remove(Institution $institution, User $user): JsonResponse
    {
        $this->authorize('delete', $institution);

        try {
            $institution->belongsToMany(User::class, 'institution_user', 'institution_id', 'user_id')
                ->detach($user->id);

            return response()->noContent();
        } catch (Throwable $e) {
            Log::error('Institution member delete error', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal mengeluarkan anggota.'], 500);
        }
    }
}
