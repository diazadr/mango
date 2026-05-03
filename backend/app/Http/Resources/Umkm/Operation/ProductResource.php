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
            'is_active' => (bool) $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
