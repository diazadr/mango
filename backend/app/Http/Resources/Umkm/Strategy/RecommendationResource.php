<?php

namespace App\Http\Resources\Umkm\Strategy;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecommendationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assessment_result_id' => $this->assessment_result_id,
            'category' => new AssessmentCategoryResource($this->whenLoaded('category')),
            'recommendation_text' => $this->recommendation_text,
            'gap_score' => $this->gap_score,
            'priority' => $this->priority,
        ];
    }
}
