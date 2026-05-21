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
        'pic_name',
        'pic_phone',
        'description',
        'email',
        'xendit_sub_account_id',
        'bank_code',
        'bank_account_name',
        'bank_account_number',
        'phone',
        'address',
        'province',
        'regency',
        'district',
        'village',
        'postal_code',
        'latitude',
        'longitude',
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
            ->keepOriginalImageFormat()
            ->nonQueued();

        $this->addMediaConversion('large')
            ->width(500)
            ->height(500)
            ->sharpen(10)
            ->keepOriginalImageFormat()
            ->nonQueued();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
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

    public function users()
    {
        return $this->belongsToMany(\App\Models\User::class, 'institution_user', 'institution_id', 'user_id')
                    ->withPivot(['id', 'department_id', 'is_active', 'joined_at'])
                    ->wherePivot('is_active', true);
    }
}
