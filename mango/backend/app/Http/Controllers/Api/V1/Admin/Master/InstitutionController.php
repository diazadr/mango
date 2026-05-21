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
            // Singular institution: Polman Bandung
            $query = Institution::where('slug', 'polman-bandung');
            
            // Simple list for dropdowns
            if ($request->has('simple')) {
                return response()->json([
                    'data' => $query->get(['id', 'name']),
                ]);
            }

            return $this->resource(OrganizationResource::collection(
                $query->paginate(1)
            ));
        } catch (Throwable $e) {
            Log::error('Institution index error', ['message' => $e->getMessage()]);

            return response()->json(['message' => 'Gagal mengambil data institusi.'], 500);
        }
    }

    /**
     * Creation disabled as per requirements.
     */
    public function store(StoreInstitutionRequest $request): JsonResponse
    {
        return $this->error('Penambahan institusi dinonaktifkan. Institusi bersifat tunggal.', 403);
    }

    /**
     * Show institution detail.
     */
    public function show(Institution $institution): JsonResponse
    {
        if ($institution->slug !== 'polman-bandung') {
            return $this->error('Akses dibatasi hanya untuk institusi utama.', 403);
        }

        return $this->resource(new OrganizationResource(
            $institution->load(['departments'])
        ));
    }

    /**
     * Update institution info.
     */
    public function update(UpdateInstitutionRequest $request, Institution $institution): JsonResponse
    {
        if ($institution->slug !== 'polman-bandung') {
            return $this->error('Hanya institusi utama yang dapat diperbarui.', 403);
        }

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
     * Deletion disabled as per requirements.
     */
    public function destroy(Institution $institution): JsonResponse
    {
        return $this->error('Penghapusan institusi utama dilarang.', 403);
    }
}
