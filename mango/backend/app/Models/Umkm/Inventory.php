<?php

namespace App\Models\Umkm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tracks on-hand stock of UMKM products (or raw materials).
 *
 * item_type: 'product' | 'material'
 * item_id:   FK to products.id or erp_materials.id
 */
class Inventory extends Model
{
    protected $table = 'umkm_inventories';

    protected $fillable = [
        'umkm_id',
        'item_type',
        'item_id',
        'qty_on_hand',
        'qty_reserved',
    ];

    protected function casts(): array
    {
        return [
            'qty_on_hand'   => 'decimal:3',
            'qty_reserved'  => 'decimal:3',
        ];
    }

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(Umkm::class);
    }

    public function availableQty(): float
    {
        return max(0, (float) $this->qty_on_hand - (float) $this->qty_reserved);
    }
}
