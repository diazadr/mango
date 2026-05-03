<?php

namespace App\Http\Resources\Advisor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'consultation_request_id' => $this->consultation_request_id,
            'scheduled_at' => $this->scheduled_at,
            'duration_minutes' => $this->duration_minutes,
            'medium' => $this->medium,
            'status' => $this->status,
            'notes' => ConsultationNoteResource::collection($this->whenLoaded('notes')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
