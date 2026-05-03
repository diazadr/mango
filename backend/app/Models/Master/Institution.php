<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Institution extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, SoftDeletes;

    protected $table = 'institutions';

    protected $fillable = [
        'name',
        'slug',
        'email',
        'phone',
        'address',
        'province',
        'regency',
        'district',
        'village',
        'postal_code',
        'logo',
        'is_active',
    ];

    /**
     * Register media collections.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('logos')
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
            ->width(500)
            ->height(500)
            ->sharpen(10)
            ->nonQueued();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $institution) {
            if (empty($institution->slug)) {
                $institution->slug = Str::slug($institution->name);
            }
        });
    }
}
