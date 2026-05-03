<?php

namespace App\Models\Umkm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionCapacity extends Model
{
    protected $fillable = [
        'umkm_id',
        'product_name',
        'capacity_per_day',
        'unit',
        'notes',
    ];

    protected $casts = [
        'capacity_per_day' => 'decimal:2',
    ];

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(Umkm::class);
    }
}
