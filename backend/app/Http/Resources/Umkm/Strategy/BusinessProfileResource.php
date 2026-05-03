<?php

namespace App\Http\Resources\Umkm\Strategy;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'umkm_id' => $this->id,
            'vision' => $this->vision,
            'mission' => $this->mission,
            'main_product' => $this->main_product,
            'annual_revenue' => $this->annual_revenue,
            'market_target' => $this->market_target,
            'production_workflow' => $this->production_workflow,
            'has_sop' => (bool) $this->has_sop,
        ];
    }
}
