<?php

namespace App\Http\Resources\Umkm\Strategy;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MachineManualResource extends JsonResource
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
            'machine_name' => $this->machine_name,
            'brand' => $this->brand,
            'power_consumption' => (int) $this->power_consumption,
            'purchase_year' => (int) $this->purchase_year,
            'last_maintenance_at' => $this->last_maintenance_at?->toDateString(),
            'maintenance_interval' => (int) $this->maintenance_interval,
            'dimensions' => $this->dimensions,
            'weight' => (float) $this->weight,
            'description' => $this->description,
            'quantity' => (int) $this->quantity,
            'condition' => $this->condition,
            'notes' => $this->notes,
            'image_url' => $this->getFirstMediaUrl('images', 'thumb') ?: null,
            'image_large' => $this->getFirstMediaUrl('images', 'large') ?: null,
            'image_original' => $this->getFirstMediaUrl('images') ?: null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
