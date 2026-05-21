<?php

namespace App\Http\Controllers\Api\V1\ErpMes;

use App\Http\Controllers\Controller;
use App\Models\Erp\ErpMaterial;
use App\Models\Erp\ErpMaterialMovement;
use App\Models\Umkm\Umkm;
use App\Models\Master\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class MaterialController extends Controller
{
    /** GET /v1/erp-mes/materials */
    public function index(Request $request): JsonResponse
    {
        [$ownerType, $ownerId] = $this->resolveOwner($request->user());

        $query = ErpMaterial::where('owner_type', $ownerType)->where('owner_id', $ownerId);

        if ($request->boolean('low_stock')) {
            $query->whereRaw('stock_qty <= minimum_stock');
        }

        $materials = $query->orderBy('name')->get()->map(fn($m) => $this->format($m));

        $alerts = $query->newQuery()
            ->where('owner_type', $ownerType)->where('owner_id', $ownerId)
            ->whereRaw('stock_qty <= minimum_stock')->count();

        return response()->json(['data' => $materials, 'low_stock_count' => $alerts]);
    }

    /** POST /v1/erp-mes/materials */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'sku'           => ['nullable', 'string'],
            'unit'          => ['nullable', 'string'],
            'stock_qty'     => ['nullable', 'numeric', 'min:0'],
            'minimum_stock' => ['nullable', 'numeric', 'min:0'],
            'reorder_point' => ['nullable', 'numeric', 'min:0'],
            'location'      => ['nullable', 'string'],
            'notes'         => ['nullable', 'string'],
            'images'        => ['nullable', 'array'],
            'images.*'      => ['image', 'max:2048'],
        ]);

        try {
            [$ownerType, $ownerId] = $this->resolveOwner($request->user());
            
            $data = $validated;
            unset($data['images']);
            
            $material = ErpMaterial::create(array_merge($data, [
                'owner_type' => $ownerType,
                'owner_id'   => $ownerId,
            ]));

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $material->addMedia($image)->toMediaCollection('images');
                }
            }

            return response()->json(['message' => 'Material ditambahkan.', 'data' => $this->format($material)], 201);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    /** PUT /v1/erp-mes/materials/{material} */
    public function update(Request $request, ErpMaterial $material): JsonResponse
    {
        abort_unless($this->canAccessMaterial($request->user(), $material), 403);

        $validated = $request->validate([
            'name'          => ['sometimes', 'string'],
            'sku'           => ['nullable', 'string'],
            'unit'          => ['nullable', 'string'],
            'minimum_stock' => ['nullable', 'numeric', 'min:0'],
            'reorder_point' => ['nullable', 'numeric', 'min:0'],
            'location'      => ['nullable', 'string'],
            'notes'         => ['nullable', 'string'],
            'images'        => ['nullable', 'array'],
            'images.*'      => ['image', 'max:2048'],
        ]);
        
        $data = $validated;
        unset($data['images']);
        
        $material->update($data);
        
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $material->addMedia($image)->toMediaCollection('images');
            }
        }
        
        return response()->json(['message' => 'Material diperbarui.', 'data' => $this->format($material->fresh())]);
    }

    /** DELETE /v1/erp-mes/materials/{material} */
    public function destroy(ErpMaterial $material): JsonResponse
    {
        abort_unless($this->canAccessMaterial(request()->user(), $material), 403);

        $material->delete();
        return response()->json(['message' => 'Material dihapus.']);
    }

    /** POST /v1/erp-mes/materials/{material}/movement */
    public function movement(Request $request, ErpMaterial $material): JsonResponse
    {
        abort_unless($this->canAccessMaterial($request->user(), $material), 403);

        $validated = $request->validate([
            'type'          => ['required', 'in:in,out,adjustment,return'],
            'quantity'      => ['required', 'numeric', 'min:0.001'],
            'work_order_id' => ['nullable', 'exists:work_orders,id'],
            'reference'     => ['nullable', 'string'],
            'notes'         => ['nullable', 'string'],
        ]);

        try {
            $movement = ErpMaterialMovement::create([
                'material_id'   => $material->id,
                'work_order_id' => $validated['work_order_id'] ?? null,
                'type'          => $validated['type'],
                'quantity'      => $validated['quantity'],
                'reference'     => $validated['reference'] ?? null,
                'notes'         => $validated['notes'] ?? null,
                'created_by'    => $request->user()?->id,
            ]);

            return response()->json([
                'message'      => 'Pergerakan stok dicatat.',
                'data'         => $this->format($material->fresh()),
                'movement'     => $movement,
            ]);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    /** GET /v1/erp-mes/materials/{material}/movements */
    public function movements(ErpMaterial $material): JsonResponse
    {
        abort_unless($this->canAccessMaterial(request()->user(), $material), 403);

        $movements = $material->movements()->with('creator')->orderByDesc('created_at')->get();
        return response()->json(['data' => $movements]);
    }

    private function format(ErpMaterial $m): array
    {
        $stockPct = $m->minimum_stock > 0
            ? min(100, round(($m->stock_qty / $m->minimum_stock) * 100))
            : 100;
        return [
            'id'             => $m->id,
            'name'           => $m->name,
            'sku'            => $m->sku,
            'unit'           => $m->unit,
            'stock_qty'      => (float) $m->stock_qty,
            'minimum_stock'  => (float) $m->minimum_stock,
            'reorder_point'  => (float) $m->reorder_point,
            'location'       => $m->location,
            'notes'          => $m->notes,
            'is_low_stock'   => $m->isLowStock(),
            'stock_pct'      => $stockPct, // for progress bar
            'image_url'      => $m->getFirstMediaUrl('images', 'thumb') ?: null,
            'image_large'    => $m->getFirstMediaUrl('images', 'large') ?: null,
            'images'         => $m->getMedia('images')->map(fn($media) => [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'thumb' => $media->getUrl('thumb'),
                'large' => $media->getUrl('large'),
            ])->toArray(),
            'created_at'     => $m->created_at,
        ];
    }

    private function resolveOwner($user): array
    {
        if ($user?->umkm) return [Umkm::class, $user->umkm->id];
        
        $institution = collect($user?->institutions ?? [])->first();
        if ($institution) return [\App\Models\Master\Institution::class, $institution->id ?? $institution];
        
        $org = collect($user?->organizations ?? [])->first();
        if ($org) return [Organization::class, $org->id ?? $org];
        
        return [null, null];
    }

    private function canAccessMaterial($user, ErpMaterial $material): bool
    {
        [$ownerType, $ownerId] = $this->resolveOwner($user);

        if ($user?->isSuperAdmin()) {
            return true;
        }

        return $ownerType !== null
            && $ownerId !== null
            && $material->owner_type === $ownerType
            && (int) $material->owner_id === (int) $ownerId;
    }
}
