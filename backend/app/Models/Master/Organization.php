<?php

namespace App\Models\Master;

use App\Models\Machine\Machine;
use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Organization extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'organizations';

    /**
     * Configure activity logging.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    protected $fillable = [
        'name',
        'pic_name',
        'pic_phone',
        'slug',
        'email',
        'phone',
        'address',
        'province',
        'regency',
        'district',
        'village',
        'postal_code',
        'description',
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
        static::creating(function (self $org) {
            if (empty($org->slug)) {
                $org->slug = Str::slug($org->name);
            }
        });
    }

    public function machines()
    {
        return $this->morphMany(Machine::class, 'owner');
    }

    public function umkms(): HasMany
    {
        return $this->hasMany(Umkm::class, 'organization_id');
    }
}
