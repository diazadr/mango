<?php

namespace App\Models\Mes;

use App\Models\Erp\WorkOrder;
use App\Models\Machine\Machine;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionRecord extends Model
{
    protected $table = 'erp_mes_production_records';

    protected $fillable = [
        'work_order_id',
        'machine_id',
        'institution_id',
        'organization_id',
        'umkm_id',
        'operator_user_id',
        'shift',
        'good_quantity',
        'reject_quantity',
        'reject_reason',
        'cycle_time_actual',
        'operating_time_min',
        'downtime_min',
        'recorded_at',
        'source',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at'       => 'datetime',
            'payload'           => 'array',
            'cycle_time_actual' => 'decimal:3',
            'operating_time_min'=> 'decimal:2',
            'downtime_min'      => 'decimal:2',
        ];
    }

    public function workOrder(): BelongsTo { return $this->belongsTo(WorkOrder::class); }
    public function machine(): BelongsTo { return $this->belongsTo(Machine::class); }
    public function institution(): BelongsTo { return $this->belongsTo(Institution::class); }
    public function organization(): BelongsTo { return $this->belongsTo(Organization::class); }
    public function umkm(): BelongsTo { return $this->belongsTo(Umkm::class); }
    public function operator(): BelongsTo { return $this->belongsTo(User::class, 'operator_user_id'); }
}
