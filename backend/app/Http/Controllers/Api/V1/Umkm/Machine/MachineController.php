<?php

namespace App\Http\Controllers\Api\V1\Umkm\Machine;

use App\Http\Controllers\Controller;
use App\Http\Resources\Umkm\Machine\MachineResource;
use App\Models\Machine\Machine;
use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Throwable;

class MachineController extends Controller
{
    public function index(Request $request): JsonResponse|AnonymousResourceCollection
    {
        try {
            $query = Machine::query()
                ->with('owner');

            if ($type = $request->get('type')) {
                $query->where('type', $type);
            }

            if ($status = $request->get('status')) {
                $query->where('status', $status);
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');
            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return MachineResource::collection($query->paginate($perPage));
        } catch (Throwable $e) {
            Log::error('Machine index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch machines',
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'code'        => ['required', 'string', 'unique:machines,code'],
            'type'        => ['required', 'string'],
            'brand'       => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'location'    => ['nullable', 'string'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
            'owner_id'    => ['required', 'integer'],
            'owner_type'  => [
                'required',
                'in:umkm,institution,organization',
            ],
            'image'       => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        try {
            $ownerType = match ($validated['owner_type']) {
                'umkm'         => \App\Models\Umkm\Umkm::class,
                'institution'  => \App\Models\Master\Institution::class,
                'organization' => \App\Models\Master\Organization::class,
                default        => \App\Models\Master\Organization::class,
            };

            $machine = Machine::create([
                'name'        => $validated['name'],
                'slug'        => \Illuminate\Support\Str::slug($validated['name'] . '-' . $validated['code']),
                'code'        => $validated['code'],
                'type'        => $validated['type'],
                'brand'       => $validated['brand'] ?? null,
                'description' => $validated['description'] ?? null,
                'location'    => $validated['location'] ?? null,
                'image'       => null, // Image column is now bypassed in favor of media library
                'hourly_rate' => $validated['hourly_rate'],
                'owner_id'    => $validated['owner_id'],
                'owner_type'  => $ownerType,
                'status'      => 'available',
            ]);

            if ($request->hasFile('image')) {
                $machine->addMediaFromRequest('image')->toMediaCollection('images');
            }

            return response()->json([
                'message' => 'Machine registered successfully',
                'data'    => new MachineResource($machine->fresh()),
            ], 201);
        } catch (Throwable $e) {
            Log::error('Machine store error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create machine',
            ], 500);
        }
    }

    public function show(Machine $machine): JsonResponse|MachineResource
    {
        try {
            return new MachineResource($machine->load([
                'owner',
                'reservations.requesterUmkm',
            ]));
        } catch (Throwable $e) {
            Log::error('Machine show error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch machine',
            ], 500);
        }
    }

    public function update(Request $request, Machine $machine): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'code'        => ['sometimes', 'string', 'unique:machines,code,' . $machine->id],
            'type'        => ['sometimes', 'string'],
            'brand'       => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'location'    => ['nullable', 'string'],
            'hourly_rate' => ['sometimes', 'numeric', 'min:0'],
            'status'      => ['sometimes', 'in:available,busy,maintenance'],
            'image'       => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        try {
            $machine->update($request->except('image'));

            if ($request->hasFile('image')) {
                $machine->addMediaFromRequest('image')->toMediaCollection('images');
            }

            return response()->json([
                'message' => 'Machine updated successfully',
                'data'    => new MachineResource($machine->fresh()),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine update error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update machine',
            ], 500);
        }
    }

    public function destroy(Machine $machine): JsonResponse
    {
        try {
            $machine->delete();

            return response()->json([
                'message' => 'Machine deleted successfully',
            ], 204);
        } catch (Throwable $e) {
            Log::error('Machine delete error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete machine',
            ], 500);
        }
    }

    /**
     * Return active reservations (pending + approved) for a specific machine
     * so the requester can see when the machine is busy.
     */
    public function schedule(Machine $machine): JsonResponse
    {
        try {
            $reservations = $machine->reservations()
                ->whereIn('status', ['pending', 'approved'])
                ->where('end_time', '>=', now())
                ->orderBy('start_time')
                ->get(['id', 'start_time', 'end_time', 'status', 'requester_umkm_id']);

            return response()->json([
                'data' => $reservations->map(fn($r) => [
                    'id'         => $r->id,
                    'start_time' => $r->start_time,
                    'end_time'   => $r->end_time,
                    'status'     => $r->status,
                ]),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine schedule error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Failed to fetch schedule'], 500);
        }
    }
}
