<?php

namespace App\Http\Resources\Umkm\Operation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'slug' => $this->slug,
            'umkm_id' => $this->umkm_id,
            'name' => $this->name,
            'description' => $this->description,
            'sku' => $this->sku,
            'unit' => $this->unit,
            'dimensions' => $this->dimensions,
            'weight' => (float) $this->weight,
            'price' => (float) $this->price,
            'min_stock_level' => (int) $this->min_stock_level,
            'image_url' => $this->getFirstMediaUrl('images', 'thumb') ?: null,
            'image_large' => $this->getFirstMediaUrl('images', 'large') ?: null,
            'image_original' => $this->getFirstMediaUrl('images') ?: null,
            'images' => $this->getMedia('images')->map(fn($media) => [
                'id' => $media->id,
                'url' => $media->getUrl(),
                'thumb' => $media->getUrl('thumb'),
                'large' => $media->getUrl('large'),
            ])->toArray(),
            'is_active' => (bool) $this->is_active,
            'is_showcase' => (bool) $this->is_showcase,
            'umkm' => $this->whenLoaded('umkm', fn() => [
                'name' => $this->umkm->name,
                'slug' => $this->umkm->slug,
                'regency' => $this->umkm->regency,
                'province' => $this->umkm->province,
                'address' => $this->umkm->address,
                'phone' => $this->umkm->phone,
                'email' => $this->umkm->email,
                'logo_url' => $this->umkm->getFirstMediaUrl('logos', 'thumb') ?: null,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
