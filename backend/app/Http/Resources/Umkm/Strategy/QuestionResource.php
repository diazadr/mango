<?php

namespace App\Http\Resources\Umkm\Strategy;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assessment_category_id' => $this->assessment_category_id,
            'text' => $this->text,
            'weight' => $this->weight,
            'order' => $this->order,
        ];
    }
}
