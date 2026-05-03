<?php

namespace App\Models\Umkm;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{
    use HasUuids, InteractsWithMedia, SoftDeletes;

    /**
     * The columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name).'-'.Str::lower(Str::random(6));
            }
        });
    }

    /**
     * Register media collections.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->useFallbackUrl('/images/placeholders/product.png');
    }

    /**
     * Register media conversions.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(600)
            ->height(600)
            ->sharpen(10);

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(1200)
            ->sharpen(5);
    }

    protected $fillable = [
        'uuid',
        'slug',
        'umkm_id',
        'name',
        'description',
        'sku',
        'unit',
        'dimensions',
        'weight',
        'price',
        'min_stock_level',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'weight' => 'decimal:2',
            'min_stock_level' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function umkm()
    {
        return $this->belongsTo(Umkm::class);
    }
}
