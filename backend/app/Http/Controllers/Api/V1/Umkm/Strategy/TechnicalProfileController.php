<?php

namespace App\Http\Controllers\Api\V1\Umkm\Strategy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\Strategy\StoreMachineManualRequest;
use App\Http\Requests\Umkm\Strategy\StoreProductionCapacityRequest;
use App\Http\Requests\Umkm\Strategy\UpdateMachineManualRequest;
use App\Http\Requests\Umkm\Strategy\UpdateProductionCapacityRequest;
use App\Http\Resources\Umkm\Strategy\MachineManualResource;
use App\Http\Resources\Umkm\Strategy\ProductionCapacityResource;
use App\Models\Umkm\MachineManual;
use App\Models\Umkm\ProductionCapacity;
use App\Models\Umkm\Umkm;
use App\Services\Umkm\Strategy\TechnicalProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Throwable;

class TechnicalProfileController extends Controller
{
    public function __construct(
        protected TechnicalProfileService $service
    ) {}

    public function index(Request $request): JsonResponse|AnonymousResourceCollection
    {
        $umkm = $request->user()->umkm;
        if (! $umkm) {
            return response()->json(['data' => []]);
        }

        try {
            $capacities = $this->service->getProductionCapacities($umkm);

            return ProductionCapacityResource::collection($capacities);
        } catch (Throwable $e) {
            Log::error('Production capacity index error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch'], 500);
        }
    }

    public function store(StoreProductionCapacityRequest $request): JsonResponse
    {
        $umkm = $request->user()->umkm;
        if (! $umkm) {
            return response()->json(['message' => 'UMKM profile not found'], 404);
        }

        try {
            $capacity = $this->service->storeProductionCapacity($umkm, $request->validated());

            return response()->json(['message' => 'Created successfully', 'data' => new ProductionCapacityResource($capacity)], 201);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Failed to create'], 500);
        }
    }

    public function indexMachineManuals(Request $request): JsonResponse|AnonymousResourceCollection
    {
        $umkm = $request->user()->umkm;
        if (! $umkm) {
            return response()->json(['data' => []]);
        }

        try {
            $machines = $this->service->getMachineManuals($umkm);

            return MachineManualResource::collection($machines);
        } catch (Throwable $e) {
            Log::error('Machine manual index error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch'], 500);
        }
    }

    public function storeMachineManualGlobal(StoreMachineManualRequest $request): JsonResponse
    {
        $umkm = $request->user()->umkm;
        if (! $umkm) {
            return response()->json(['message' => 'UMKM profile not found'], 404);
        }

        try {
            $machine = $this->service->storeMachineManual($umkm, $request->validated());

            return response()->json(['message' => 'Created successfully', 'data' => new MachineManualResource($machine)], 201);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Failed to create'], 500);
        }
    }

    public function getProductionCapacities(Umkm $umkm): JsonResponse|AnonymousResourceCollection
    {
        $this->authorize('update', $umkm);

        try {
            $capacities = $this->service->getProductionCapacities($umkm);

            return ProductionCapacityResource::collection($capacities);
        } catch (Throwable $e) {
            Log::error('Production capacity index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch production capacities',
            ], 500);
        }
    }

    public function storeProductionCapacity(
        StoreProductionCapacityRequest $request,
        Umkm $umkm
    ): JsonResponse {
        $this->authorize('update', $umkm);

        try {
            $capacity = $this->service->storeProductionCapacity($umkm, $request->validated());

            return response()->json([
                'message' => 'Production capacity created successfully',
                'data' => new ProductionCapacityResource($capacity),
            ], 201);
        } catch (Throwable $e) {
            Log::error('Production capacity store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create production capacity',
            ], 500);
        }
    }

    public function updateProductionCapacity(
        UpdateProductionCapacityRequest $request,
        ProductionCapacity $capacity
    ): JsonResponse {
        $this->authorize('update', $capacity->umkm);

        try {
            $capacity = $this->service->updateProductionCapacity($capacity, $request->validated());

            return response()->json([
                'message' => 'Production capacity updated successfully',
                'data' => new ProductionCapacityResource($capacity),
            ]);
        } catch (Throwable $e) {
            Log::error('Production capacity update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update production capacity',
            ], 500);
        }
    }

    public function destroyProductionCapacity(ProductionCapacity $capacity): JsonResponse
    {
        $this->authorize('update', $capacity->umkm);

        try {
            $this->service->deleteProductionCapacity($capacity);

            return response()->json(null, 204);
        } catch (Throwable $e) {
            Log::error('Production capacity delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to delete production capacity',
            ], 500);
        }
    }

    public function getMachineManuals(Umkm $umkm): JsonResponse|AnonymousResourceCollection
    {
        $this->authorize('update', $umkm);

        try {
            $machines = $this->service->getMachineManuals($umkm);

            return MachineManualResource::collection($machines);
        } catch (Throwable $e) {
            Log::error('Machine manual index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch machine manuals',
            ], 500);
        }
    }

    public function storeMachineManual(
        StoreMachineManualRequest $request,
        Umkm $umkm
    ): JsonResponse {
        $this->authorize('update', $umkm);

        try {
            $machine = $this->service->storeMachineManual($umkm, $request->validated());

            return response()->json([
                'message' => 'Machine manual created successfully',
                'data' => new MachineManualResource($machine),
            ], 201);
        } catch (Throwable $e) {
            Log::error('Machine manual store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create machine manual',
            ], 500);
        }
    }

    public function updateMachineManual(
        UpdateMachineManualRequest $request,
        MachineManual $machine
    ): JsonResponse {
        $this->authorize('update', $machine->umkm);

        try {
            $machine = $this->service->updateMachineManual($machine, $request->validated());

            return response()->json([
                'message' => 'Machine manual updated successfully',
                'data' => new MachineManualResource($machine),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine manual update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update machine manual',
            ], 500);
        }
    }

    public function destroyMachineManual(MachineManual $machine): JsonResponse
    {
        $this->authorize('update', $machine->umkm);

        try {
            $this->service->deleteMachineManual($machine);

            return response()->json(null, 204);
        } catch (Throwable $e) {
            Log::error('Machine manual delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to delete machine manual',
            ], 500);
        }
    }
}
