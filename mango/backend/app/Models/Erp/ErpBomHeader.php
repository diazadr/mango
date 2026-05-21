<?php

namespace App\Models\Erp;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ErpBomHeader extends Model
{
    protected $table = 'erp_bom_headers';

    protected $fillable = ['product_id', 'version', 'is_active', 'notes'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function product(): BelongsTo { return $this->belongsTo(ErpProduct::class, 'product_id'); }
    public function lines(): HasMany { return $this->hasMany(ErpBomLine::class, 'bom_id')->orderBy('sort_order'); }
}
