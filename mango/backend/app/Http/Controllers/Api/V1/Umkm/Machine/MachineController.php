<?php

namespace App\Http\Controllers\Api\V1\Umkm\Machine;

use App\Http\Controllers\Controller;
use App\Http\Resources\Umkm\Machine\MachineResource;
use App\Models\Machine\Machine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Throwable;

class MachineController extends Controller
{
    /**
     * List machines with flexible filters.
     *
     * Query params:
     *   owner=me          → hanya mesin milik user yg login (untuk Profil Teknis & ERP dropdown)
     *   is_reservable=1   → hanya mesin yang bisa disewa (untuk katalog reservasi)
     *   is_iot_enabled=1  → hanya mesin IoT (untuk edge sync)
     *   type=CNC          → filter tipe
     *   status=available  → filter status
     */
    public function index(Request $request): JsonResponse|AnonymousResourceCollection
    {
        try {
            $query = Machine::query()->with('owner');

            // ── Filter: mesin milik user yang login ────────────────────────────
            if ($request->get('owner') === 'me') {
                $user = $request->user();
                [$ownerType, $ownerId] = $this->resolveOwner($user);
                if ($ownerType && $ownerId) {
                    $query->where('owner_type', $ownerType)->where('owner_id', $ownerId);
                }
            }

            // ── Filter: hanya mesin reservasi ──────────────────────────────────
            if ($request->boolean('is_reservable')) {
                $query->where('is_reservable', true);
            }

            // ── Filter: hanya mesin IoT ────────────────────────────────────────
            if ($request->boolean('is_iot_enabled')) {
                $query->where('is_iot_enabled', true);
            }

            // ── Filter umum ────────────────────────────────────────────────────
            if ($type = $request->get('type')) {
                $query->where('type', $type);
            }
            if ($status = $request->get('status')) {
                $query->where('status', $status);
            }
            if ($condition = $request->get('condition')) {
                $query->where('condition', $condition);
            }

            $sortBy  = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');
            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 200);

            return MachineResource::collection($query->paginate($perPage));
        } catch (Throwable $e) {
            Log::error('Machine index error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch machines'], 500);
        }
    }

    /**
     * Daftarkan mesin baru (dari Profil Teknis atau Katalog Reservasi).
     * code → auto-generated jika tidak diisi (format: MSIN-0001)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // Identitas
            'name'          => ['required', 'string', 'max:255'],
            'code'          => ['nullable', 'string', 'unique:machines,code'],
            'type'          => ['nullable', 'string'],
            'brand'         => ['nullable', 'string'],
            'description'   => ['nullable', 'string'],
            'location'      => ['nullable', 'string'],
            'image'         => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],

            // Operasional
            'hourly_rate'   => ['nullable', 'numeric', 'min:0'],
            'status'        => ['nullable', 'in:available,busy,maintenance'],

            // Owner (bisa dari frontend atau resolve dari token)
            'owner_id'      => ['nullable', 'integer'],
            'owner_type'    => ['nullable', 'in:umkm,institution,organization'],

            // Flags
            'is_iot_enabled' => ['nullable', 'boolean'],
            'is_reservable'  => ['nullable', 'boolean'],

            // Inventaris / aset
            'quantity'                  => ['nullable', 'integer', 'min:1'],
            'condition'                 => ['nullable', 'in:good,fair,poor'],
            'purchase_year'             => ['nullable', 'integer', 'min:1900', 'max:2099'],
            'last_maintenance_at'       => ['nullable', 'date'],
            'maintenance_interval_days' => ['nullable', 'integer', 'min:1'],
            'power_consumption_watt'    => ['nullable', 'integer'],
            'dimensions'                => ['nullable', 'string'],
            'weight_kg'                 => ['nullable', 'numeric'],
            'notes'                     => ['nullable', 'string'],
        ]);

        try {
            // Resolve owner dari token jika tidak dikirim frontend
            [$resolvedOwnerType, $resolvedOwnerId] = $this->resolveOwner($request->user());

            $ownerType = $this->mapOwnerType($validated['owner_type'] ?? null) ?? $resolvedOwnerType;
            $ownerId   = $validated['owner_id'] ?? $resolvedOwnerId;

            if (!$ownerType || !$ownerId) {
                return response()->json(['message' => 'Owner tidak ditemukan. Lengkapi profil terlebih dahulu.'], 422);
            }

            $machine = Machine::create([
                'name'                      => $validated['name'],
                'code'                      => $validated['code'] ?? null, // auto-generated di model boot
                'type'                      => $validated['type'] ?? null,
                'brand'                     => $validated['brand'] ?? null,
                'description'               => $validated['description'] ?? null,
                'location'                  => $validated['location'] ?? null,
                'hourly_rate'               => $validated['hourly_rate'] ?? 0,
                'status'                    => $validated['status'] ?? 'available',
                'owner_id'                  => $ownerId,
                'owner_type'                => $ownerType,
                'is_iot_enabled'            => $validated['is_iot_enabled'] ?? false,
                'is_reservable'             => $validated['is_reservable'] ?? false,
                'quantity'                  => $validated['quantity'] ?? 1,
                'condition'                 => $validated['condition'] ?? 'good',
                'purchase_year'             => $validated['purchase_year'] ?? null,
                'last_maintenance_at'       => $validated['last_maintenance_at'] ?? null,
                'maintenance_interval_days' => $validated['maintenance_interval_days'] ?? null,
                'power_consumption_watt'    => $validated['power_consumption_watt'] ?? null,
                'dimensions'                => $validated['dimensions'] ?? null,
                'weight_kg'                 => $validated['weight_kg'] ?? null,
                'notes'                     => $validated['notes'] ?? null,
            ]);

            if ($request->hasFile('image')) {
                $machine->addMediaFromRequest('image')->toMediaCollection('images');
            }

            return response()->json([
                'message' => 'Mesin berhasil didaftarkan.',
                'data'    => new MachineResource($machine->fresh()),
            ], 201);
        } catch (Throwable $e) {
            Log::error('Machine store error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Gagal mendaftarkan mesin: ' . $e->getMessage()], 500);
        }
    }

    public function show(Machine $machine): JsonResponse|MachineResource
    {
        try {
            return new MachineResource($machine->load(['owner', 'reservations.requesterUmkm']));
        } catch (Throwable $e) {
            return response()->json(['message' => 'Failed to fetch machine'], 500);
        }
    }

    public function update(Request $request, Machine $machine): JsonResponse
    {
        $validated = $request->validate([
            'name'                      => ['sometimes', 'string', 'max:255'],
            'code'                      => ['sometimes', 'nullable', 'string', 'unique:machines,code,' . $machine->id],
            'type'                      => ['sometimes', 'nullable', 'string'],
            'brand'                     => ['nullable', 'string'],
            'description'               => ['nullable', 'string'],
            'location'                  => ['nullable', 'string'],
            'hourly_rate'               => ['sometimes', 'numeric', 'min:0'],
            'status'                    => ['sometimes', 'in:available,busy,maintenance'],
            'image'                     => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_iot_enabled'            => ['sometimes', 'boolean'],
            'is_reservable'             => ['sometimes', 'boolean'],
            'quantity'                  => ['sometimes', 'integer', 'min:1'],
            'condition'                 => ['sometimes', 'in:good,fair,poor'],
            'purchase_year'             => ['nullable', 'integer', 'min:1900', 'max:2099'],
            'last_maintenance_at'       => ['nullable', 'date'],
            'maintenance_interval_days' => ['nullable', 'integer'],
            'power_consumption_watt'    => ['nullable', 'integer'],
            'dimensions'                => ['nullable', 'string'],
            'weight_kg'                 => ['nullable', 'numeric'],
            'notes'                     => ['nullable', 'string'],
        ]);

        try {
            $newStatus   = $validated['status'] ?? null;
            $wasChanged  = $newStatus && $newStatus !== $machine->status;
            $cancelledCount = 0;

            \Illuminate\Support\Facades\DB::transaction(function () use ($machine, $validated, $request, $newStatus, $wasChanged, &$cancelledCount) {
                $machine->update(collect($validated)->except('image')->toArray());

                if ($request->hasFile('image')) {
                    $machine->addMediaFromRequest('image')->toMediaCollection('images');
                }

                // [FIX] Jika status berubah ke maintenance, batalkan semua reservasi aktif
                // agar pemohon tidak menunggu pada mesin yang sedang rusak/perbaikan.
                if ($wasChanged && $newStatus === 'maintenance') {
                    $activeStatuses = ['pending', 'approved', 'negotiating', 'cancel_requested'];

                    $cancelledCount = $machine->reservations()
                        ->whereIn('status', $activeStatuses)
                        ->update([
                            'status'           => 'rejected',
                            'rejection_reason'  => 'Mesin sedang dalam perbaikan (maintenance) oleh pemilik. Reservasi dibatalkan secara otomatis.',
                        ]);
                }
            });

            $message = 'Mesin berhasil diperbarui.';
            if ($cancelledCount > 0) {
                $message .= " {$cancelledCount} reservasi aktif dibatalkan otomatis karena mesin dalam status maintenance.";
            }

            return response()->json([
                'message'             => $message,
                'data'                => new MachineResource($machine->fresh()),
                'cancelled_count'     => $cancelledCount,
            ]);
        } catch (Throwable $e) {
            Log::error('Machine update error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui mesin.'], 500);
        }
    }

    public function destroy(Machine $machine): JsonResponse
    {
        try {
            $machine->delete();
            return response()->json(['message' => 'Mesin berhasil dihapus.'], 200);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Gagal menghapus mesin.'], 500);
        }
    }

    public function schedule(Machine $machine): JsonResponse
    {
        try {
            $reservations = $machine->reservations()
                ->whereIn('status', ['pending', 'approved'])
                ->where('end_time', '>=', now())
                ->orderBy('start_time')
                ->get(['id', 'start_time', 'end_time', 'status']);

            return response()->json(['data' => $reservations]);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Failed to fetch schedule'], 500);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Resolve owner type & id dari user yang login.
     */
    private function resolveOwner($user): array
    {
        if (!$user) return [null, null];

        if ($user->umkm) {
            return [\App\Models\Umkm\Umkm::class, $user->umkm->id];
        }
        if ($organizations = $user->organizations ?? null) {
            $org = is_iterable($organizations) ? collect($organizations)->first() : null;
            if ($org) {
                return [\App\Models\Master\Organization::class, $org->id ?? $org];
            }
        }
        if ($institutions = $user->institutions ?? null) {
            $inst = is_iterable($institutions) ? collect($institutions)->first() : null;
            if ($inst) {
                return [\App\Models\Master\Institution::class, $inst->id ?? $inst];
            }
        }
        return [null, null];
    }

    private function mapOwnerType(?string $type): ?string
    {
        return match ($type) {
            'umkm'         => \App\Models\Umkm\Umkm::class,
            'institution'  => \App\Models\Master\Institution::class,
            'organization' => \App\Models\Master\Organization::class,
            default        => null,
        };
    }
}
