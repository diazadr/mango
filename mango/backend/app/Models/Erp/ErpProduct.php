<?php

namespace App\Models\Erp;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ErpProduct extends Model implements HasMedia
{
    use SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'owner_type', 'owner_id',
        'name', 'sku', 'unit',
        'description', 'image', 'is_active',
        'is_saleable',
        'umkm_product_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_saleable' => 'boolean',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')->width(200)->height(200)->keepOriginalImageFormat()->nonQueued();
                $this->addMediaConversion('large')->width(800)->height(800)->keepOriginalImageFormat()->nonQueued();
            });
    }

    public function owner(): MorphTo { return $this->morphTo(); }
    public function bomHeaders(): HasMany { return $this->hasMany(ErpBomHeader::class, 'product_id'); }
    public function workOrders(): HasMany { return $this->hasMany(WorkOrder::class, 'product_id'); }

    public function activeBom(): ?ErpBomHeader
    {
        return $this->bomHeaders()->where('is_active', true)->latest()->first();
    }
}
