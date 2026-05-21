<?php

namespace App\Http\Controllers\Api\V1\Umkm\Operation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\Operation\StoreProductRequest;
use App\Http\Requests\Umkm\Operation\UpdateProductRequest;
use App\Http\Resources\Umkm\Operation\ProductResource;
use App\Models\Umkm\Product;
use App\Models\Umkm\Umkm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProductController extends Controller
{
    public function indexGlobal(Request $request): JsonResponse|AnonymousResourceCollection
    {
        $umkm = $request->user()->umkm;
        if (! $umkm) {
            return response()->json(['data' => []]);
        }

        return $this->index($request, $umkm);
    }

    public function storeGlobal(StoreProductRequest $request): JsonResponse
    {
        $umkm = $request->user()->umkm;
        if (! $umkm) {
            return response()->json(['message' => 'UMKM profile not found'], 404);
        }

        return $this->store($request, $umkm);
    }

    public function index(Request $request, Umkm $umkm): JsonResponse|AnonymousResourceCollection
    {
        try {
            $query = $umkm->products();

            if ($search = $request->get('search')) {
                $query->where('name', 'like', "%{$search}%");
            }

            if ($request->has('is_active')) {
                $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');
            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return ProductResource::collection($query->paginate($perPage));
        } catch (Throwable $e) {
            Log::error('Product index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch products',
            ], 500);
        }
    }

    public function store(StoreProductRequest $request, Umkm $umkm): JsonResponse
    {
        $this->authorize('update', $umkm);

        try {
            $data = $request->validated();
            $images = $request->file('images');
            unset($data['images']);

            $product = $umkm->products()->create($data);

            if ($images) {
                foreach ($images as $image) {
                    $product->addMedia($image)->toMediaCollection('images');
                }
            }

            return response()->json([
                'message' => 'Product created successfully',
                'data' => new ProductResource($product),
            ], 201);
        } catch (Throwable $e) {
            Log::error('Product store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create product',
            ], 500);
        }
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product->umkm);

        try {
            $data = $request->validated();
            $images = $request->file('images');
            unset($data['images']);
            unset($data['remove_image_ids']);

            $product->update($data);

            // Hapus gambar yang dipilih user untuk dihapus
            $removeIds = $request->input('remove_image_ids', []);
            if (!empty($removeIds)) {
                $product->getMedia('images')
                    ->whereIn('id', (array) $removeIds)
                    ->each(fn($media) => $media->delete());
            }

            // Tambah gambar baru jika ada
            if ($images) {
                $existingCount = $product->getMedia('images')->count();
                $allowedNew = max(0, 5 - $existingCount);
                foreach (array_slice($images, 0, $allowedNew) as $image) {
                    $product->addMedia($image)->toMediaCollection('images');
                }
            }

            return response()->json([
                'message' => 'Product updated successfully',
                'data'    => new ProductResource($product->fresh()),
            ]);
        } catch (Throwable $e) {
            Log::error('Product update error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update product',
            ], 500);
        }
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product->umkm);

        try {
            $product->delete();

            return response()->json(null, 204);
        } catch (Throwable $e) {
            Log::error('Product delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to delete product',
            ], 500);
        }
    }
}
