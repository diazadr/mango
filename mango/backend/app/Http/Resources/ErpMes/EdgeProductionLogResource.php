<?php

namespace App\Http\Resources\ErpMes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EdgeProductionLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'machine_code' => $this->machine_code,
            'work_order' => $this->work_order,
            'part_number' => $this->part_number,
            'shift' => $this->shift,
            'operator_id' => $this->operator_id,
            'good_quantity' => $this->good_quantity,
            'defect_quantity' => $this->defect_quantity,
            'actual_cycle_time' => $this->actual_cycle_time !== null ? (float) $this->actual_cycle_time : null,
            'operating_time_min' => $this->operating_time_min !== null ? (float) $this->operating_time_min : null,
            'downtime_min' => $this->downtime_min !== null ? (float) $this->downtime_min : null,
            'downtime_category' => $this->downtime_category,
            'oee_percentage' => $this->oee_percentage !== null ? (float) $this->oee_percentage : null,
            'availability' => $this->availability !== null ? (float) $this->availability : null,
            'performance' => $this->performance !== null ? (float) $this->performance : null,
            'quality' => $this->quality !== null ? (float) $this->quality : null,
            'recorded_at' => $this->recorded_at?->toISOString(),
            'machine' => $this->whenLoaded('machine', fn () => [
                'id' => $this->machine?->id,
                'name' => $this->machine?->name,
                'code' => $this->machine?->code,
            ]),
        ];
    }
}
