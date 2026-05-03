<?php

namespace App\Http\Resources\Auth;

use App\Http\Resources\Admin\Master\UmkmResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'phone' => $this->phone,
            'nik' => $this->nik,
            'dob' => $this->dob?->toDateString(),
            'avatar_url' => $this->getFirstMediaUrl('avatars', 'thumb') ?: null,
            'avatar_large' => $this->getFirstMediaUrl('avatars', 'large') ?: null,
            'avatar_original' => $this->getFirstMediaUrl('avatars') ?: null,
            'is_active' => (bool) $this->is_active,

            'roles' => $this->whenLoaded(
                'roles',
                fn () => $this->roles
                    ->pluck('name')
                    ->values()
            ),

            'institutions' => $this->whenLoaded(
                'institutions',
                fn () => $this->institutions
                    ->map(fn ($institution) => [
                        'id' => $institution->id,
                        'name' => $institution->name,
                    ])
                    ->values()
            ),

            'organizations' => $this->whenLoaded(
                'organizations',
                fn () => $this->organizations
                    ->map(fn ($org) => [
                        'id' => $org->id,
                        'name' => $org->name,
                    ])
                    ->values()
            ),

            'umkm' => $this->whenLoaded(
                'umkm',
                fn () => new UmkmResource($this->umkm)
            ),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
