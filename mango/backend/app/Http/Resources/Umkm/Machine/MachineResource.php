<?php

namespace App\Http\Resources\Umkm\Machine;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MachineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // ── Identitas ──────────────────────────────────────────────────
            'id'          => $this->id,
            'name'        => $this->name,
            'code'        => $this->code,
            'type'        => $this->type,
            'brand'       => $this->brand,
            'description' => $this->description,
            'location'    => $this->location,
            'slug'        => $this->slug,

            // ── Operasional ────────────────────────────────────────────────
            'status'       => $this->status,
            'is_available' => $this->status === 'available',
            'hourly_rate'  => (float) $this->hourly_rate,

            // ── Flags / Peran ──────────────────────────────────────────────
            'is_iot_enabled' => (bool) $this->is_iot_enabled,
            'is_reservable'  => (bool) $this->is_reservable,

            // ── Inventaris / Aset ──────────────────────────────────────────
            'quantity'                  => (int) ($this->quantity ?? 1),
            'condition'                 => $this->condition ?? 'good',
            'condition_label'           => match ($this->condition) {
                'good'  => 'Prima',
                'fair'  => 'Cukup Baik',
                'poor'  => 'Butuh Perbaikan',
                default => 'Tidak Diketahui',
            },
            'purchase_year'             => $this->purchase_year,
            'last_maintenance_at'       => $this->last_maintenance_at?->format('Y-m-d'),
            'maintenance_interval_days' => $this->maintenance_interval_days,
            'power_consumption_watt'    => $this->power_consumption_watt,
            'dimensions'                => $this->dimensions,
            'weight_kg'                 => $this->weight_kg,
            'notes'                     => $this->notes,

            // ── Media ──────────────────────────────────────────────────────
            'image'       => $this->getFirstMediaUrl('images', 'thumb') ?: null,
            'image_url'   => $this->getFirstMediaUrl('images', 'thumb') ?: null,
            'image_large' => $this->getFirstMediaUrl('images', 'large') ?: null,
            'images'      => $this->getMedia('images')->map(function($media) {
                return [
                    'id'    => $media->id,
                    'url'   => $media->getUrl('large'),
                    'thumb' => $media->getUrl('thumb'),
                ];
            }),

            // ── Owner ──────────────────────────────────────────────────────
            'owner_id'          => $this->owner_id,
            'owner_type'        => $this->owner_type,
            'owner_entity_type' => str_contains($this->owner_type ?? '', 'Umkm') ? 'umkm' : 'institution',
            'owner'             => $this->whenLoaded('owner'),

            // ── Timestamps ─────────────────────────────────────────────────
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
