<?php

namespace App\Http\Resources\Advisor;

use App\Http\Resources\Auth\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MentorAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'consultation_request_id' => $this->consultation_request_id,
            'mentor_user_id' => $this->mentor_user_id,
            'assigned_by' => $this->assigned_by,
            'assigned_at' => $this->assigned_at,
            'mentor' => new UserResource($this->whenLoaded('mentor')),
            'assigner' => new UserResource($this->whenLoaded('assigner')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
