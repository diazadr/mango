<?php

namespace App\Http\Controllers\Api\V1\Admin\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Master\StoreInstitutionRequest;
use App\Http\Requests\Admin\Master\UpdateInstitutionRequest;
use App\Http\Resources\Admin\Master\OrganizationResource;
use App\Models\Master\Institution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class InstitutionController extends Controller
{
    /**
     * List all institutions (Campus/UPT).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Simple list for dropdowns
            if ($request->has('simple')) {
                $data = Institution::where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name']);

                return response()->json([
                    'data' => $data,
                ]);
            }

            $user = $request->user();

            if ($user && $user->hasRole('super_admin')) {
                $query = Institution::query();
            } elseif ($user) {
                $query = $user->institutions();
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
            Log::error('Institution index error', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal mengambil data institusi.'], 500);
        }
    }

    /**
     * Register a new institution.
     */
    public function store(StoreInstitutionRequest $request): JsonResponse
    {
        try {
            $institution = Institution::create($request->validated());

            if ($request->hasFile('logo')) {
                $institution->addMediaFromRequest('logo')->toMediaCollection('logos');
            }

            return $this->resource(new OrganizationResource($institution), 'Institusi berhasil dibuat.', 201);
        } catch (Throwable $e) {
            Log::error('Institution store error', ['message' => $e->getMessage()]);

            return $this->error('Gagal membuat institusi.', 500);
        }
    }

    /**
     * Show institution detail.
     */
    public function show(Institution $institution): JsonResponse
    {
        return $this->resource(new OrganizationResource(
            $institution->load(['departments'])
        ));
    }

    /**
     * Update institution info.
     */
    public function update(UpdateInstitutionRequest $request, Institution $institution): JsonResponse
    {
        try {
            $institution->update($request->validated());

            if ($request->hasFile('logo')) {
                $institution->addMediaFromRequest('logo')->toMediaCollection('logos');
            }

            return $this->resource(new OrganizationResource($institution->fresh()), 'Data institusi diperbarui.');
        } catch (Throwable $e) {
            Log::error('Institution update error', ['message' => $e->getMessage()]);

            return $this->error('Gagal memperbarui institusi.', 500);
        }
    }

    /**
     * Delete institution.
     */
    public function destroy(Institution $institution): JsonResponse
    {
        try {
            $institution->delete();

            return $this->ok(null, 'Institusi berhasil dihapus.', 204);
        } catch (Throwable $e) {
            Log::error('Institution delete error', ['message' => $e->getMessage()]);

            return $this->error('Gagal menghapus institusi.', 500);
        }
    }
}
