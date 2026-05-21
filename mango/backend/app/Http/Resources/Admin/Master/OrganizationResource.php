<?php

namespace App\Http\Resources\Admin\Master;

use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    /**
     * The "data" wrapper that should be applied.
     *
     * @var string|null
     */
    public static $wrap = null;

    public function toArray($request)
    {
        $isInstitution = $this->resource instanceof \App\Models\Master\Institution;
        
        $picName = $this->pic_name;
        if (empty($picName) || $isInstitution) {
            if ($isInstitution) {
                // Fetch the admin user for the institution
                $adminUser = $this->users()->whereHas('roles', function ($q) {
                    $q->where('name', 'admin');
                })->first();
                if ($adminUser) {
                    $picName = $adminUser->name;
                }
            } else {
                $orgUser = $this->users()->first();
                if ($orgUser) {
                    $picName = $orgUser->name;
                }
            }
        }

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'pic_name' => $picName,
            'pic_phone' => $this->pic_phone,
            'description' => $this->description,
            'entity_type' => $isInstitution ? 'institution' : 'organization',
            'display_type' => $isInstitution ? 'Kampus / Institusi' : 'Organisasi UMKM / Paguyuban',

            'email' => $this->email,
            'phone' => $this->phone,

            'logo_url' => $this->getFirstMediaUrl('logos', 'thumb') ?: null,
            'logo_large' => $this->getFirstMediaUrl('logos', 'large') ?: null,

            'address' => $this->address,
            'province' => $this->province,
            'regency' => $this->regency,
            'district' => $this->district,
            'village' => $this->village,
            'postal_code' => $this->postal_code,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            
            'is_active' => (bool) $this->is_active,
            
            'departments' => $this->whenLoaded('departments'),
            'members' => $this->when($isInstitution, function() {
                // If we want to show UMKM members for institution
                return $this->whenLoaded('umkms');
            }, function() {
                // For Organization, maybe it also has umkms
                return $this->whenLoaded('umkms');
            }),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
