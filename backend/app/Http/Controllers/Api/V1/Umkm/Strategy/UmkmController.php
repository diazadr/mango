<?php

namespace App\Http\Controllers\Api\V1\Umkm\Strategy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\Strategy\StoreUmkmRequest;
use App\Http\Requests\Umkm\Strategy\UpdateUmkmRequest;
use App\Http\Resources\Admin\Master\UmkmResource;
use App\Models\Umkm\Umkm;
use App\Services\Admin\Master\UmkmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class UmkmController extends Controller
{
    /**
     * @OA\Get(
     *     path="/v1/umkm",
     *     summary="Get my UMKM data",
     *     tags={"UMKM Strategy"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Response(response=200, description="UMKM data list")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $query = Umkm::query()
                ->with([
                    'institution',
                    'organization',
                ])
                ->withCount('products');

            if ($user->hasRole('super_admin')) {
                // No extra filter
            } elseif ($user->hasAnyRole(['admin', 'advisor', 'upt'])) {
                // Institution filtering is handled by policy and admin endpoints.
            } else {
                // Default UMKM owner view
                $query->where('user_id', $user->id);
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');

            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return $this->resource(UmkmResource::collection(
                $query->paginate($perPage)
            ));
        } catch (Throwable $e) {
            Log::error('UMKM index error', [
                'message' => $e->getMessage(),
            ]);

            return $this->error('Gagal mengambil data UMKM.', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/v1/umkm",
     *     summary="Onboarding: Create UMKM with Logo",
     *     tags={"UMKM Strategy"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\RequestBody(
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *
     *             @OA\Schema(
     *
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="sector", type="string"),
     *                 @OA\Property(property="nib", type="string"),
     *                 @OA\Property(property="established_year", type="integer"),
     *                 @OA\Property(property="employee_count", type="integer"),
     *                 @OA\Property(property="logo", type="string", format="binary")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Created")
     * )
     */
    public function store(
        StoreUmkmRequest $request,
        UmkmService $service
    ): JsonResponse {
        try {
            $umkm = $service->create(
                $request->user(),
                $request->validated()
            );

            return $this->resource(new UmkmResource($umkm), 'Pendaftaran UMKM berhasil.', 201);
        } catch (Throwable $e) {
            Log::error('UMKM store error', [
                'message' => $e->getMessage(),
            ]);

            return $this->error($e->getMessage() ?: 'Gagal mendaftarkan UMKM.', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/v1/umkm/{umkm}",
     *     summary="Show UMKM detail",
     *     tags={"UMKM Strategy"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Response(response=200, description="Detail")
     * )
     */
    public function show(Umkm $umkm): JsonResponse
    {
        $this->authorize('view', $umkm);

        try {
            $umkm->load([
                'institution',
                'organization',
            ])->loadCount('products');

            return $this->resource(new UmkmResource($umkm));
        } catch (Throwable $e) {
            Log::error('UMKM show error', [
                'message' => $e->getMessage(),
            ]);

            return $this->error('Gagal mengambil detail UMKM.', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/v1/umkm/{umkm}",
     *     summary="Update UMKM info and logo",
     *     tags={"UMKM Strategy"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\RequestBody(
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *
     *             @OA\Schema(
     *
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="logo", type="string", format="binary"),
     *                 @OA\Property(property="_method", type="string", example="PUT")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Updated")
     * )
     */
    public function update(
        UpdateUmkmRequest $request,
        Umkm $umkm,
        UmkmService $service
    ): JsonResponse {
        $this->authorize('update', $umkm);

        try {
            $updated = $service->update(
                $umkm,
                $request->validated()
            );

            return $this->resource(new UmkmResource($updated), 'Data UMKM berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('UMKM update error', [
                'message' => $e->getMessage(),
            ]);

            return $this->error('Gagal memperbarui data UMKM.', 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/v1/umkm/{umkm}",
     *     summary="Delete UMKM",
     *     tags={"UMKM Strategy"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Response(response=204, description="Deleted")
     * )
     */
    public function destroy(
        Umkm $umkm,
        UmkmService $service
    ): JsonResponse {
        $this->authorize('delete', $umkm);

        try {
            $service->delete($umkm);

            return $this->ok(null, 'Data UMKM berhasil dihapus.', 204);
        } catch (Throwable $e) {
            Log::error('UMKM delete error', [
                'message' => $e->getMessage(),
            ]);

            return $this->error('Gagal menghapus data UMKM.', 500);
        }
    }
}
