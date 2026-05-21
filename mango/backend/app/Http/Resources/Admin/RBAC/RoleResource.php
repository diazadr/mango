<?php

namespace App\Http\Resources\Admin\RBAC;

use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,

            'name' => $this->name,
            'guard_name' => $this->guard_name,

            'permissions' => $this->whenLoaded('permissions', function () {
                return $this->permissions->pluck('name')->values();
            }),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
