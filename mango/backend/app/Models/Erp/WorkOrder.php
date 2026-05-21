<?php

namespace App\Models\Erp;

use App\Models\Machine\Machine;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Mes\AlarmEvent;
use App\Models\Mes\DowntimeLog;
use App\Models\Mes\ProductionRecord;
use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkOrder extends Model
{
    use SoftDeletes;

    protected $table = 'erp_mes_work_orders';

    protected $fillable = [
        'code', 'machine_id', 'operator_id',
        'product_id', 'bom_id', 'quantity_planned',
        'institution_id', 'organization_id', 'umkm_id',
        'title', 'part_number',
        'target_quantity', 'completed_quantity', 'reject_quantity',
        'priority', 'status', 'shift', 'source', 'notes',
        'planned_start_at', 'planned_end_at',
        'actual_start_at', 'actual_end_at',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'planned_start_at' => 'datetime',
            'planned_end_at'   => 'datetime',
            'actual_start_at'  => 'datetime',
            'actual_end_at'    => 'datetime',
            'payload'          => 'array',
        ];
    }

    public function machine(): BelongsTo { return $this->belongsTo(Machine::class); }
    public function operator(): BelongsTo { return $this->belongsTo(User::class, 'operator_id'); }
    public function product(): BelongsTo { return $this->belongsTo(ErpProduct::class, 'product_id'); }
    public function bom(): BelongsTo { return $this->belongsTo(ErpBomHeader::class, 'bom_id'); }
    public function institution(): BelongsTo { return $this->belongsTo(Institution::class); }
    public function organization(): BelongsTo { return $this->belongsTo(Organization::class); }
    public function umkm(): BelongsTo { return $this->belongsTo(Umkm::class); }
    public function productionRecords(): HasMany { return $this->hasMany(ProductionRecord::class); }
    public function alarmEvents(): HasMany { return $this->hasMany(AlarmEvent::class); }
    public function operations(): HasMany { return $this->hasMany(WorkOrderOperation::class)->orderBy('sequence'); }
    public function downtimeLogs(): HasMany { return $this->hasMany(DowntimeLog::class); }
}
