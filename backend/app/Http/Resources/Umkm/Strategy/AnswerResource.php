<?php

namespace App\Http\Resources\Umkm\Strategy;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnswerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'question' => new QuestionResource($this->whenLoaded('question')),
            'score' => $this->score,
            'notes' => $this->notes,
        ];
    }
}
