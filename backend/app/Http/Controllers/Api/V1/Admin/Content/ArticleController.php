<?php

namespace App\Http\Controllers\Api\V1\Admin\Content;

use App\Http\Controllers\Controller;
use App\Http\Resources\Content\ArticleResource;
use App\Models\Content\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Throwable;

class ArticleController extends Controller
{
    /**
     * @OA\Get(
     *     path="/v1/articles",
     *     summary="List all published articles (Public)",
     *     tags={"Articles"},
     *
     *     @OA\Parameter(name="category", in="query", @OA\Schema(type="string")),
     *
     *     @OA\Response(response=200, description="Articles fetched")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Article::query()
                ->where('status', 'published')
                ->with('author:id,name')
                ->orderBy('published_at', 'desc');

            if ($category = $request->get('category')) {
                $query->where('category', $category);
            }

            $perPage = min((int) $request->get('per_page', 9), 100);

            return $this->resource(ArticleResource::collection($query->paginate($perPage)));
        } catch (Throwable $e) {
            Log::error('Article public index error', ['message' => $e->getMessage()]);

            return $this->error('Gagal mengambil artikel.', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/v1/articles/{slug}",
     *     summary="Get single published article",
     *     tags={"Articles"},
     *
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *
     *     @OA\Response(response=200, description="Article detail")
     * )
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $article = Article::query()
                ->where('slug', $slug)
                ->where('status', 'published')
                ->with('author:id,name')
                ->firstOrFail();

            return $this->resource(new ArticleResource($article));
        } catch (Throwable $e) {
            Log::error('Article public show error', ['message' => $e->getMessage()]);

            return $this->error('Artikel tidak ditemukan.', 404);
        }
    }

    /**
     * @OA\Get(
     *     path="/admin/articles",
     *     summary="List all articles for admin",
     *     tags={"Admin Articles"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Response(response=200, description="Articles fetched")
     * )
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $query = Article::query()->with('author:id,name');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');
            $query->orderBy($sortBy, $sortDir);

            return $this->resource(ArticleResource::collection($query->paginate(15)));
        } catch (Throwable $e) {
            Log::error('Article admin index error', ['message' => $e->getMessage()]);

            return $this->error('Gagal mengambil data artikel.', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/admin/articles",
     *     summary="Create new article with cover image",
     *     tags={"Admin Articles"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\RequestBody(
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *
     *             @OA\Schema(
     *                 required={"title", "content", "category", "status"},
     *
     *                 @OA\Property(property="title", type="string"),
     *                 @OA\Property(property="content", type="string"),
     *                 @OA\Property(property="category", type="string"),
     *                 @OA\Property(property="status", type="string", enum={"draft", "published"}),
     *                 @OA\Property(property="cover_image", type="string", format="binary")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Created")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'category' => ['required', 'string', 'max:50'],
            'status' => ['required', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);

        try {
            $validated['author_id'] = $request->user()->id;
            if ($validated['status'] === 'published' && empty($validated['published_at'])) {
                $validated['published_at'] = now();
            }

            $coverImage = $validated['cover_image'] ?? null;
            unset($validated['cover_image']);

            $article = Article::create($validated);

            if ($coverImage instanceof UploadedFile) {
                $article->addMedia($coverImage)->toMediaCollection('cover_images');
            }

            return $this->resource(new ArticleResource($article), 'Artikel berhasil dibuat.', 201);
        } catch (Throwable $e) {
            Log::error('Article store error', ['message' => $e->getMessage()]);

            return $this->error('Gagal membuat artikel.', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/admin/articles/{article}",
     *     summary="Update article and cover image",
     *     tags={"Admin Articles"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="article", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *
     *             @OA\Schema(
     *
     *                 @OA\Property(property="title", type="string"),
     *                 @OA\Property(property="cover_image", type="string", format="binary"),
     *                 @OA\Property(property="_method", type="string", example="PUT")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Updated")
     * )
     */
    public function update(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'category' => ['sometimes', 'required', 'string', 'max:50'],
            'status' => ['sometimes', 'required', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);

        try {
            if (isset($validated['status']) && $validated['status'] === 'published' && ! $article->published_at) {
                $validated['published_at'] = now();
            }

            if (isset($validated['cover_image']) && $validated['cover_image'] instanceof UploadedFile) {
                $article->addMedia($validated['cover_image'])->toMediaCollection('cover_images');
                unset($validated['cover_image']);
            }

            $article->update($validated);

            return $this->resource(new ArticleResource($article), 'Artikel berhasil diperbarui.');
        } catch (Throwable $e) {
            Log::error('Article update error', ['message' => $e->getMessage()]);

            return $this->error('Gagal memperbarui artikel.', 500);
        }
    }

    public function destroy(Article $article): JsonResponse
    {
        try {
            $article->delete();

            return $this->ok(null, 'Artikel dihapus.', 204);
        } catch (Throwable $e) {
            Log::error('Article delete error', ['message' => $e->getMessage()]);

            return $this->error('Gagal menghapus artikel.', 500);
        }
    }
}
