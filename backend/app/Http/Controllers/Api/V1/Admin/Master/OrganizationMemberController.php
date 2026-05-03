<?php

namespace App\Http\Controllers\Api\V1\Admin\Master;

use App\Http\Controllers\Controller;
use App\Models\Master\Organization;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrganizationMemberController extends Controller
{
    /**
     * List organization members.
     */
    public function index(Request $request, Organization $organization): JsonResponse
    {
        $this->authorize('view', $organization);

        try {
            $query = $organization->belongsToMany(User::class, 'organization_user', 'organization_id', 'user_id')
                ->withPivot(['id', 'is_active', 'joined_at'])
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
            Log::error('Organization member index error', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal mengambil data anggota organisasi.'], 500);
        }
    }

    /**
     * Update member status.
     */
    public function updateStatus(Request $request, Organization $organization, User $user): JsonResponse
    {
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        try {
            $organization->belongsToMany(User::class, 'organization_user', 'organization_id', 'user_id')
                ->updateExistingPivot($user->id, [
                    'is_active' => $validated['is_active'],
                ]);

            return response()->json(['message' => 'Status anggota berhasil diperbarui.']);
        } catch (Throwable $e) {
            Log::error('Organization member update error', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal memperbarui status anggota.'], 500);
        }
    }

    /**
     * Remove member from organization.
     */
    public function remove(Organization $organization, User $user): JsonResponse
    {
        $this->authorize('delete', $organization);

        try {
            $organization->belongsToMany(User::class, 'organization_user', 'organization_id', 'user_id')
                ->detach($user->id);

            return response()->noContent();
        } catch (Throwable $e) {
            Log::error('Organization member delete error', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal mengeluarkan anggota.'], 500);
        }
    }
}
