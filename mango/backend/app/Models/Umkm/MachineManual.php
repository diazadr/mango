<?php

namespace App\Models\Umkm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MachineManual extends Model implements HasMedia
{
    use InteractsWithMedia;

    /**
     * Register media collections.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->singleFile()
            ->useFallbackUrl('/images/placeholders/machine.png');
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
        'umkm_id',
        'machine_name',
        'brand',
        'power_consumption',
        'purchase_year',
        'last_maintenance_at',
        'maintenance_interval',
        'dimensions',
        'weight',
        'description',
        'quantity',
        'condition',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'power_consumption' => 'integer',
        'purchase_year' => 'integer',
        'last_maintenance_at' => 'date',
        'maintenance_interval' => 'integer',
        'weight' => 'decimal:2',
    ];

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(Umkm::class);
    }
}
