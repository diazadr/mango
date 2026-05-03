<?php

namespace App\Http\Resources\Umkm\Machine;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MachineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'code'             => $this->code,
            'type'             => $this->type,
            'brand'            => $this->brand,
            'description'      => $this->description,
            'location'         => $this->location,
            'hourly_rate'      => (float) $this->hourly_rate,
            'status'           => $this->status,
            'is_available'     => $this->status === 'available',
            
            'image'            => $this->getFirstMediaUrl('images', 'thumb') ?: null,
            'image_url'        => $this->getFirstMediaUrl('images', 'thumb') ?: null,
            'image_large'      => $this->getFirstMediaUrl('images', 'large') ?: null,
            
            'owner_id'         => $this->owner_id,
            'owner_type'       => $this->owner_type,
            'owner_entity_type' => str_contains($this->owner_type, 'Umkm') ? 'umkm' : 'institution',
            'owner'            => $this->whenLoaded('owner'),
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}
