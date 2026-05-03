<?php

namespace App\Http\Controllers\Api\V1\Admin\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Master\StoreOrganizationRequest;
use App\Http\Requests\Admin\Master\UpdateOrganizationRequest;
use App\Http\Resources\Admin\Master\OrganizationResource;
use App\Models\Master\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrganizationController extends Controller
{
    /**
     * List all organizations (UMKM Paguyuban).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Simple list for dropdowns
            if ($request->has('simple')) {
                $data = Organization::where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name']);

                return response()->json([
                    'data' => $data,
                ]);
            }

            $user = $request->user();

            if ($user && $user->hasRole('super_admin')) {
                $query = Organization::query();
            } elseif ($user) {
                $query = $user->organizations();
            } else {
                return $this->error('Unauthorized.', 401);
            }

            if ($search = $request->get('search')) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');
            $allowedSorts = ['name', 'created_at', 'updated_at'];

            if (! in_array($sortBy, $allowedSorts, true)) {
                $sortBy = 'created_at';
            }

            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return $this->resource(OrganizationResource::collection(
                $query->paginate($perPage)
            ));
        } catch (Throwable $e) {
            Log::error('Organization index error', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal mengambil data organisasi.'], 500);
        }
    }

    /**
     * Register a new organization.
     */
    public function store(StoreOrganizationRequest $request): JsonResponse
    {
        try {
            $organization = Organization::create($request->validated());

            if ($request->hasFile('logo')) {
                $organization->addMediaFromRequest('logo')->toMediaCollection('logos');
            }

            return $this->resource(new OrganizationResource($organization), 'Organisasi berhasil dibuat.', 201);
        } catch (Throwable $e) {
            Log::error('Organization store error', ['message' => $e->getMessage()]);

            return $this->error('Gagal membuat organisasi.', 500);
        }
    }

    /**
     * Show organization detail.
     */
    public function show(Organization $organization): JsonResponse
    {
        return $this->resource(new OrganizationResource(
            $organization->load(['umkms'])
        ));
    }

    /**
     * Update organization info.
     */
    public function update(UpdateOrganizationRequest $request, Organization $organization): JsonResponse
    {
        try {
            $organization->update($request->validated());

            if ($request->hasFile('logo')) {
                $organization->addMediaFromRequest('logo')->toMediaCollection('logos');
            }

            return $this->resource(new OrganizationResource($organization->fresh()), 'Data organisasi diperbarui.');
        } catch (Throwable $e) {
            Log::error('Organization update error', ['message' => $e->getMessage()]);

            return $this->error('Gagal memperbarui organisasi.', 500);
        }
    }

    /**
     * Delete organization.
     */
    public function destroy(Organization $organization): JsonResponse
    {
        try {
            $organization->delete();

            return $this->ok(null, 'Organisasi berhasil dihapus.', 204);
        } catch (Throwable $e) {
            Log::error('Organization delete error', ['message' => $e->getMessage()]);

            return $this->error('Gagal menghapus organisasi.', 500);
        }
    }
}
