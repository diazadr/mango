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
            return $this->getFirstMediaUrl('cover_images');
        }

        return null;
    }
}
