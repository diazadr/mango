<?php

namespace App\Http\Controllers\Api\V1\ErpMes;

use App\Http\Controllers\Controller;
use App\Models\Erp\ErpBomHeader;
use App\Models\Erp\ErpBomLine;
use App\Models\Erp\ErpProduct;
use App\Models\Umkm\Umkm;
use App\Models\Master\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class ProductController extends Controller
{
    /** GET /v1/erp-mes/products */
    public function index(Request $request): JsonResponse
    {
        [$ownerType, $ownerId] = $this->resolveOwner($request->user());

        $query = ErpProduct::with(['bomHeaders' => fn($q) => $q->where('is_active', true)->with('lines')])
            ->where('owner_type', $ownerType)
            ->where('owner_id', $ownerId)
            ->where('is_active', true)
            ->orderByDesc('created_at');

        return response()->json(['data' => $query->get()->map(fn($p) => $this->format($p))]);
    }

    /** POST /v1/erp-mes/products */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'sku'         => ['nullable', 'string', 'max:100'],
            'unit'        => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'umkm_product_id' => ['nullable', 'exists:products,id'],
            'bom_lines'   => ['nullable', 'array'],
            'bom_lines.*.material_name' => ['required_with:bom_lines', 'string'],
            'bom_lines.*.quantity'      => ['required_with:bom_lines', 'numeric', 'min:0.001'],
            'bom_lines.*.unit'          => ['nullable', 'string'],
            'images'      => ['nullable', 'array'],
            'images.*'    => ['image', 'max:2048'],
        ]);

        try {
            [$ownerType, $ownerId] = $this->resolveOwner($request->user());
            $product = ErpProduct::create([
                'owner_type'  => $ownerType,
                'owner_id'    => $ownerId,
                'name'        => $validated['name'],
                'sku'         => $validated['sku'] ?? null,
                'unit'        => $validated['unit'] ?? 'pcs',
                'description' => $validated['description'] ?? null,
                'umkm_product_id' => $validated['umkm_product_id'] ?? null,
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $product->addMedia($image)->toMediaCollection('images');
                }
            }

            if (!empty($validated['bom_lines'])) {
                $bom = ErpBomHeader::create(['product_id' => $product->id, 'version' => '1.0', 'is_active' => true]);
                foreach ($validated['bom_lines'] as $i => $line) {
                    ErpBomLine::create([
                        'bom_id'        => $bom->id,
                        'material_name' => $line['material_name'],
                        'quantity'      => $line['quantity'],
                        'unit'          => $line['unit'] ?? 'pcs',
                        'sort_order'    => $i,
                    ]);
                }
            }

            return response()->json(['message' => 'Produk berhasil ditambahkan.', 'data' => $this->format($product->fresh(['bomHeaders.lines']))], 201);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    /** PUT /v1/erp-mes/products/{product} */
    public function update(Request $request, ErpProduct $product): JsonResponse
    {
        abort_unless($this->canAccessProduct($request->user(), $product), 403);

        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'sku'         => ['nullable', 'string'],
            'unit'        => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'umkm_product_id' => ['nullable', 'exists:products,id'],
            'images'      => ['nullable', 'array'],
            'images.*'    => ['image', 'max:2048'],
        ]);
        
        $data = $validated;
        unset($data['images']);
        
        $product->update($data);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $product->addMedia($image)->toMediaCollection('images');
            }
        }

        return response()->json(['message' => 'Produk diperbarui.', 'data' => $this->format($product->fresh(['bomHeaders.lines']))]);
    }

    /** DELETE /v1/erp-mes/products/{product} */
    public function destroy(ErpProduct $product): JsonResponse
    {
        abort_unless($this->canAccessProduct(request()->user(), $product), 403);

        $product->delete();
        return response()->json(['message' => 'Produk dihapus.']);
    }

    /** POST /v1/erp-mes/products/{product}/bom — update/replace BOM */
    public function updateBom(Request $request, ErpProduct $product): JsonResponse
    {
        abort_unless($this->canAccessProduct($request->user(), $product), 403);

        $validated = $request->validate([
            'lines'             => ['required', 'array', 'min:1'],
            'lines.*.material_name' => ['required', 'string'],
            'lines.*.quantity'      => ['required', 'numeric', 'min:0.001'],
            'lines.*.unit'          => ['nullable', 'string'],
            'lines.*.notes'         => ['nullable', 'string'],
        ]);

        try {
            // Deactivate old BOMs
            $product->bomHeaders()->update(['is_active' => false]);

            $bom = ErpBomHeader::create(['product_id' => $product->id, 'version' => date('Y.m.d'), 'is_active' => true]);
            foreach ($validated['lines'] as $i => $line) {
                ErpBomLine::create([
                    'bom_id'        => $bom->id,
                    'material_name' => $line['material_name'],
                    'quantity'      => $line['quantity'],
                    'unit'          => $line['unit'] ?? 'pcs',
                    'notes'         => $line['notes'] ?? null,
                    'sort_order'    => $i,
                ]);
            }

            return response()->json(['message' => 'BOM diperbarui.', 'data' => $this->format($product->fresh(['bomHeaders.lines']))]);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    private function format(ErpProduct $p): array
    {
        $activeBom = $p->bomHeaders->where('is_active', true)->first();
        return [
            'id'          => $p->id,
            'name'        => $p->name,
            'sku'         => $p->sku,
            'unit'        => $p->unit,
            'description' => $p->description,
            'umkm_product_id' => $p->umkm_product_id,
            'is_active'   => $p->is_active,
            'image_url'   => $p->getFirstMediaUrl('images', 'thumb') ?: null,
            'image_large' => $p->getFirstMediaUrl('images', 'large') ?: null,
            'images'      => $p->getMedia('images')->map(fn($media) => [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'thumb' => $media->getUrl('thumb'),
                'large' => $media->getUrl('large'),
            ])->toArray(),
            'bom'         => $activeBom ? [
                'id'      => $activeBom->id,
                'version' => $activeBom->version,
                'lines'   => $activeBom->lines->map(fn($l) => [
                    'id'            => $l->id,
                    'material_name' => $l->material_name,
                    'material_sku'  => $l->material_sku,
                    'quantity'      => (float) $l->quantity,
                    'unit'          => $l->unit,
                    'sort_order'    => $l->sort_order,
                ]),
            ] : null,
            'created_at' => $p->created_at,
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

    private function canAccessProduct($user, ErpProduct $product): bool
    {
        [$ownerType, $ownerId] = $this->resolveOwner($user);

        if ($user?->isSuperAdmin()) {
            return true;
        }

        return $ownerType !== null
            && $ownerId !== null
            && $product->owner_type === $ownerType
            && (int) $product->owner_id === (int) $ownerId;
    }
}
