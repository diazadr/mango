<?php

namespace App\Http\Resources\ErpMes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlarmEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'message' => $this->message,
            'severity' => $this->severity,
            'status' => $this->status,
            'occurred_at' => $this->occurred_at?->toISOString(),
            'resolved_at' => $this->resolved_at?->toISOString(),
            'work_order' => $this->whenLoaded('workOrder', fn () => [
                'id' => $this->workOrder?->id,
                'code' => $this->workOrder?->code,
                'title' => $this->workOrder?->title,
            ]),
            'machine' => $this->whenLoaded('machine', fn () => [
                'id' => $this->machine?->id,
                'name' => $this->machine?->name,
                'code' => $this->machine?->code,
            ]),
            'institution' => $this->whenLoaded('institution', fn () => $this->institution?->only(['id', 'name', 'slug'])),
            'organization' => $this->whenLoaded('organization', fn () => $this->organization?->only(['id', 'name', 'slug'])),
            'umkm' => $this->whenLoaded('umkm', fn () => $this->umkm?->only(['id', 'uuid', 'name', 'slug'])),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
