<?php

namespace App\Http\Resources\ErpMes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'part_number' => $this->part_number,
            'target_quantity' => $this->target_quantity,
            'completed_quantity' => $this->completed_quantity,
            'reject_quantity' => $this->reject_quantity,
            'priority' => $this->priority,
            'status' => $this->status,
            'shift' => $this->shift,
            'source' => $this->source,
            'notes' => $this->notes,
            'planned_start_at' => $this->planned_start_at?->toISOString(),
            'planned_end_at' => $this->planned_end_at?->toISOString(),
            'actual_start_at' => $this->actual_start_at?->toISOString(),
            'actual_end_at' => $this->actual_end_at?->toISOString(),
            'machine' => $this->whenLoaded('machine', fn () => [
                'id' => $this->machine?->id,
                'name' => $this->machine?->name,
                'code' => $this->machine?->code,
                'type' => $this->machine?->type,
            ]),
            'institution' => $this->whenLoaded('institution', fn () => $this->institution?->only(['id', 'name', 'slug'])),
            'organization' => $this->whenLoaded('organization', fn () => $this->organization?->only(['id', 'name', 'slug'])),
            'umkm' => $this->whenLoaded('umkm', fn () => $this->umkm?->only(['id', 'uuid', 'name', 'slug'])),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
