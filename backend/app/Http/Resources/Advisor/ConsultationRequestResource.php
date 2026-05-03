<?php

namespace App\Http\Resources\Advisor;

use App\Http\Resources\Admin\Master\DepartmentResource;
use App\Http\Resources\Admin\Master\UmkmResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'umkm_id' => $this->umkm_id,
            'umkm' => new UmkmResource($this->whenLoaded('umkm')),
            'requested_by' => $this->requested_by,
            'topic' => $this->topic,
            'description' => $this->description,
            'status' => $this->status,
            'department_id' => $this->department_id,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'assignments' => MentorAssignmentResource::collection($this->whenLoaded('assignments')),
            'sessions' => ConsultationSessionResource::collection($this->whenLoaded('sessions')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
