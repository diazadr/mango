<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Content\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Article::query()
                ->where('status', 'published')
                ->with('author:id,name')
                ->orderBy('published_at', 'desc');

            if ($category = $request->get('category')) {
                $query->where('category', $category);
            }

            if ($search = $request->get('search')) {
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            }

            $perPage = min((int) $request->get('per_page', 9), 100);

            return response()->json(
                $query->paginate($perPage)
            );
        } catch (Throwable $e) {
            Log::error('Article public index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch articles',
            ], 500);
        }
    }

    public function show(string $slug)
    {
        try {
            $article = Article::query()
                ->where('slug', $slug)
                ->where('status', 'published')
                ->with('author:id,name')
                ->firstOrFail();

            return response()->json([
                'data' => $article,
            ]);
        } catch (Throwable $e) {
            Log::error('Article public show error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch article',
            ], 500);
        }
    }

    public function adminIndex(Request $request)
    {
        try {
            $query = Article::query()
                ->with('author:id,name');

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');

            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return response()->json(
                $query->paginate($perPage)
            );
        } catch (Throwable $e) {
            Log::error('Article admin index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch articles',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:50'],
            'status' => ['required', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);

        try {
            $validated['author_id'] = $request->user()->id;

            if (
                $validated['status'] === 'published' &&
                empty($validated['published_at'])
            ) {
                $validated['published_at'] = now();
            }

            $article = Article::create($validated);

            return response()->json([
                'message' => 'Article created successfully',
                'data' => $article,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Article store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create article',
            ], 500);
        }
    }

    public function update(
        Request $request,
        Article $article
    ) {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'string'],
            'category' => ['sometimes', 'required', 'string', 'max:50'],
            'status' => ['sometimes', 'required', 'in:draft,published'],
            'published_at' => ['nullable', 'date'],
        ]);

        try {
            if (
                isset($validated['status']) &&
                $validated['status'] === 'published' &&
                ! $article->published_at
            ) {
                $validated['published_at'] = now();
            }

            $article->update($validated);

            return response()->json([
                'message' => 'Article updated successfully',
                'data' => $article,
            ]);
        } catch (Throwable $e) {
            Log::error('Article update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update article',
            ], 500);
        }
    }

    public function destroy(Article $article)
    {
        try {
            $article->delete();

            return response()->noContent();
        } catch (Throwable $e) {
            Log::error('Article delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to delete article',
            ], 500);
        }
    }
}
