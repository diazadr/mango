<?php

namespace App\Models\Erp;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class ErpMaterialMovement extends Model
{
    protected $table = 'erp_material_movements';

    protected $fillable = [
        'material_id', 'work_order_id', 'type',
        'quantity', 'qty_before', 'qty_after',
        'reference', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity'   => 'decimal:3',
            'qty_before' => 'decimal:3',
            'qty_after'  => 'decimal:3',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $movement) {
            $material = ErpMaterial::find($movement->material_id);
            if ($material) {
                $movement->qty_before = $material->stock_qty;
                $delta = in_array($movement->type, ['in', 'return'])
                    ? $movement->quantity
                    : -$movement->quantity;
                $movement->qty_after = max(0, $material->stock_qty + $delta);

                // Update stock
                $material->stock_qty = $movement->qty_after;
                $material->save();
            }
        });
    }

    public function material(): BelongsTo { return $this->belongsTo(ErpMaterial::class, 'material_id'); }
    public function workOrder(): BelongsTo { return $this->belongsTo(WorkOrder::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
