<?php

namespace App\Http\Resources\Umkm\Strategy;

use App\Http\Resources\Admin\Master\UmkmResource;
use App\Services\Umkm\Strategy\AssessmentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'umkm_id' => $this->umkm_id,
            'umkm' => new UmkmResource($this->whenLoaded('umkm')),
            'total_score' => $this->total_score,
            'level' => $this->level,
            'status' => $this->status,
            'assessment_date' => $this->created_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'chart_data' => resolve(AssessmentService::class)->getChartData($this->resource),
            'answers' => AnswerResource::collection($this->whenLoaded('answers')),
            'recommendations' => RecommendationResource::collection($this->whenLoaded('recommendations')),
        ];
    }
}
