<?php

namespace App\Http\Resources\Content;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'category' => $this->category,
            'status' => $this->status,
            'views_count' => (int) ($this->views_count ?? 0),
            'cover_image' => $this->getCoverImageUrl(),
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'author' => [
                'id' => $this->author_id,
                'name' => $this->author?->name,
            ],
        ];
    }

    protected function getCoverImageUrl(): ?string
    {
        if (method_exists($this->resource, 'getFirstMediaUrl')) {
            $url = $this->getFirstMediaUrl('cover_images');
            if ($url && $url !== '') {
                return $url;
            }
        }

        // Fallback to cover_image column if it's a URL or path
        if ($this->cover_image && $this->cover_image !== '') {
            if (filter_var($this->cover_image, FILTER_VALIDATE_URL)) {
                return $this->cover_image;
            }
            return asset('storage/' . $this->cover_image);
        }

        return null;
    }
}
