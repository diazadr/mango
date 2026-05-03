<?php

namespace App\Models\Machine;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Machine extends Model implements HasMedia
{
    use InteractsWithMedia, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'code',
        'type',
        'brand',
        'description',
        'location',
        'image',
        'owner_id',
        'owner_type',
        'status',
        'hourly_rate',
        'is_iot_enabled',
    ];

    /**
     * Register media collections.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->singleFile();
    }

    /**
     * Register media conversions.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(150)
            ->height(150)
            ->sharpen(10)
            ->nonQueued();

        $this->addMediaConversion('large')
            ->width(800)
            ->height(800)
            ->sharpen(10)
            ->nonQueued();
    }

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(MachineReservation::class);
    }
}
