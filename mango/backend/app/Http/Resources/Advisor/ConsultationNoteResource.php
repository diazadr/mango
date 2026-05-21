<?php

namespace App\Http\Resources\Advisor;

use App\Http\Resources\Auth\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'consultation_session_id' => $this->consultation_session_id,
            'author_id' => $this->author_id,
            'content' => $this->content,
            'author' => new UserResource($this->whenLoaded('author')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
