<?php

namespace App\Http\Resources\Admin\Master;

use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,

            'name' => $this->name,
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,
            'institution_id' => $this->institution_id,

            'institution' => $this->whenLoaded('institution', function () {
                return [
                    'id' => $this->institution->id,
                    'name' => $this->institution->name,
                ];
            }),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
