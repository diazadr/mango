<?php

namespace App\Http\Resources\ErpMes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EdgeAlarmLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'machine_code' => $this->machine_code,
            'alarm_code' => $this->alarm_code,
            'message' => $this->message,
            'severity' => $this->severity,
            'occurred_at' => $this->occurred_at?->toISOString(),
            'resolved_at' => $this->resolved_at?->toISOString(),
            'machine' => $this->whenLoaded('machine', fn () => [
                'id' => $this->machine?->id,
                'name' => $this->machine?->name,
                'code' => $this->machine?->code,
            ]),
        ];
    }
}
