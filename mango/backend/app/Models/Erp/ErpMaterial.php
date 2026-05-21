<?php

namespace App\Models\Erp;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ErpMaterial extends Model implements HasMedia
{
    use SoftDeletes, InteractsWithMedia;

    protected $table = 'erp_materials';

    protected $fillable = [
        'owner_type', 'owner_id',
        'name', 'sku', 'unit',
        'stock_qty', 'minimum_stock', 'reorder_point',
        'location', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'stock_qty'     => 'decimal:3',
            'minimum_stock' => 'decimal:3',
            'reorder_point' => 'decimal:3',
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
    public function movements(): HasMany { return $this->hasMany(ErpMaterialMovement::class, 'material_id'); }

    public function isLowStock(): bool
    {
        return (float) $this->stock_qty <= (float) $this->minimum_stock;
    }
}
