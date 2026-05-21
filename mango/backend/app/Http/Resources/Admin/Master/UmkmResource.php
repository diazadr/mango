<?php

namespace App\Http\Resources\Admin\Master;

use App\Http\Resources\Umkm\Strategy\BusinessProfileResource;
use Illuminate\Http\Resources\Json\JsonResource;

class UmkmResource extends JsonResource
{
    /**
     * The "data" wrapper that should be applied.
     *
     * @var string|null
     */
    public static $wrap = null;

    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'slug' => $this->slug,
            'registration_number' => $this->registration_number,
            'name' => $this->name,
            'description' => $this->description,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'legal_entity_type' => $this->legal_entity_type,
            'website' => $this->website,
            'logo_url' => $this->getFirstMediaUrl('logos', 'thumb') ?: null,
            'logo_large' => $this->getFirstMediaUrl('logos', 'large') ?: null,
            'logo_original' => $this->getFirstMediaUrl('logos') ?: null,
            'province' => $this->province,
            'regency' => $this->regency,
            'district' => $this->district,
            'village' => $this->village,
            'postal_code' => $this->postal_code,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'sector' => $this->sector,
            'nib' => $this->nib,
            'established_year' => $this->established_year,
            'employee_count' => $this->employee_count,
            'operating_hours' => $this->operating_hours,

            'is_active' => (bool) $this->is_active,
            'status' => $this->status,
            'owner_name' => $this->user ? $this->user->name : 'N/A',
            'rejection_reason' => $this->rejection_reason,
            'institution_id' => $this->institution_id,
            'organization_id' => $this->organization_id,
            'user_id' => $this->user_id,


            'institution' => $this->whenLoaded('institution', function () {
                return [
                    'id' => $this->institution->id,
                    'name' => $this->institution->name,
                    'slug' => $this->institution->slug,
                ];
            }),

            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'slug' => $this->organization->slug,
                ];
            }),

            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),


            'products' => \App\Http\Resources\Umkm\Operation\ProductResource::collection($this->whenLoaded('products')),

            'assessment_results' => $this->whenLoaded('assessmentResults', function () {
                return $this->assessmentResults->map(function ($result) {
                    return [
                        'id' => $result->id,
                        'score' => $result->total_score,
                        'status' => $result->status,
                        'assessment_title' => $result->level ? "Level: {$result->level}" : "Assesment UMKM",
                        'completed_at' => $result->submitted_at?->toISOString(),
                    ];
                });
            }),

            'products_count' => $this->whenCounted('products'),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
