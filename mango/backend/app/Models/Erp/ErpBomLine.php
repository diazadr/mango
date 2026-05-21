<?php

namespace App\Models\Erp;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ErpBomLine extends Model
{
    protected $table = 'erp_bom_lines';

    protected $fillable = [
        'bom_id', 'material_name', 'material_sku',
        'quantity', 'unit', 'notes', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3', 'sort_order' => 'integer'];
    }

    public function bom(): BelongsTo { return $this->belongsTo(ErpBomHeader::class, 'bom_id'); }
}
