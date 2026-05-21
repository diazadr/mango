<?php

namespace App\Models\Machine;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Machine extends Model implements HasMedia
{
    use InteractsWithMedia, SoftDeletes;

    protected $fillable = [
        // Identitas mesin
        'name', 'slug', 'code', 'type', 'brand', 'description',
        'location', 'image', 'owner_id', 'owner_type',

        // Status & operasional
        'status',        // available | busy | maintenance
        'hourly_rate',
        'specifications',

        // IoT / Edge flags
        'is_iot_enabled', // terhubung CNC edge
        'is_reservable',  // bisa disewa partner lain

        // Inventaris / aset
        'quantity',
        'condition',             // good | fair | poor
        'purchase_year',
        'last_maintenance_at',
        'maintenance_interval_days',
        'power_consumption_watt',
        'dimensions',
        'weight_kg',
        'notes',
    ];

    protected $casts = [
        'is_iot_enabled'      => 'boolean',
        'is_reservable'       => 'boolean',
        'hourly_rate'         => 'float',
        'quantity'            => 'integer',
        'purchase_year'       => 'integer',
        'last_maintenance_at' => 'date',
        'specifications'      => 'array',
    ];

    // ── Auto-generate code & slug ────────────────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (Machine $machine) {
            // Auto-generate slug
            if (empty($machine->slug)) {
                $machine->slug = Str::slug($machine->name) . '-' . Str::random(5);
            }

            // Auto-generate code jika tidak diisi
            if (empty($machine->code)) {
                $machine->code = self::generateCode();
            }
        });
    }

    public static function generateCode(): string
    {
        $prefix = 'MSIN';
        $last = self::withTrashed()
            ->where('code', 'LIKE', $prefix . '-%')
            ->orderByDesc('id')
            ->value('code');

        if ($last) {
            $num = (int) substr($last, strlen($prefix) + 1);
            return $prefix . '-' . str_pad($num + 1, 4, '0', STR_PAD_LEFT);
        }
        return $prefix . '-0001';
    }

    // ── Media ────────────────────────────────────────────────────────────────

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(600)->height(600)->sharpen(10)->nonQueued();

        $this->addMediaConversion('large')
            ->width(1200)->height(1200)->sharpen(10)->nonQueued();
    }

    // ── Relationships ────────────────────────────────────────────────────────

    public function owner(): MorphTo
    {
        return $this->morphTo();
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(MachineReservation::class);
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeReservable($query)
    {
        return $query->where('is_reservable', true);
    }

    public function scopeIotEnabled($query)
    {
        return $query->where('is_iot_enabled', true);
    }

    public function scopeForOwner($query, string $ownerType, int $ownerId)
    {
        return $query->where('owner_type', $ownerType)->where('owner_id', $ownerId);
    }
}
