<?php

namespace App\Http\Controllers\Api\V1\Umkm\Strategy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\Strategy\StoreBusinessProfileRequest;
use App\Http\Resources\Umkm\Strategy\BusinessProfileResource;
use App\Models\Umkm\Umkm;
use App\Services\Umkm\Strategy\BusinessProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class BusinessProfileController extends Controller
{
    public function show(
        Request $request,
        Umkm $umkm
    ) {
        $this->authorize('update', $umkm);

        try {
            return new BusinessProfileResource(
                $umkm
            );
        } catch (Throwable $e) {
            Log::error('Business profile show error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch business profile',
            ], 500);
        }
    }

    public function store(
        StoreBusinessProfileRequest $request,
        Umkm $umkm,
        BusinessProfileService $service
    ) {
        $this->authorize('update', $umkm);

        try {
            $profile = $service->upsert(
                $umkm,
                $request->validated()
            );

            return (new BusinessProfileResource($profile))
                ->response()
                ->setStatusCode(201);
        } catch (Throwable $e) {
            Log::error('Business profile store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to save business profile',
            ], 500);
        }
    }
}
