<?php

namespace App\Http\Resources\Umkm\Strategy;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductionCapacityResource extends JsonResource
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
            'umkm_id' => $this->umkm_id,
            'product_name' => $this->product_name,
            'capacity_per_day' => $this->capacity_per_day,
            'unit' => $this->unit,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
