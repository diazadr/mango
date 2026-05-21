<?php

namespace App\Http\Resources\ErpMes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductionRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shift' => $this->shift,
            'good_quantity' => $this->good_quantity,
            'reject_quantity' => $this->reject_quantity,
            'cycle_time_actual' => (float) $this->cycle_time_actual,
            'operating_time_min' => (float) $this->operating_time_min,
            'downtime_min' => (float) $this->downtime_min,
            'recorded_at' => $this->recorded_at?->toISOString(),
            'source' => $this->source,
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
            'operator' => $this->whenLoaded('operator', fn () => $this->operator?->only(['id', 'name', 'email'])),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
