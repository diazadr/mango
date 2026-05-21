<?php

namespace App\Models\Mes;

use App\Models\Erp\WorkOrder;
use App\Models\Machine\Machine;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlarmEvent extends Model
{
    protected $table = 'erp_mes_alarm_events';

    protected $fillable = [
        'work_order_id',
        'machine_id',
        'institution_id',
        'organization_id',
        'umkm_id',
        'code',
        'message',
        'severity',
        'status',
        'occurred_at',
        'resolved_at',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'resolved_at' => 'datetime',
            'payload'     => 'array',
        ];
    }

    public function workOrder(): BelongsTo { return $this->belongsTo(WorkOrder::class); }
    public function machine(): BelongsTo { return $this->belongsTo(Machine::class); }
    public function institution(): BelongsTo { return $this->belongsTo(Institution::class); }
    public function organization(): BelongsTo { return $this->belongsTo(Organization::class); }
    public function umkm(): BelongsTo { return $this->belongsTo(Umkm::class); }
}
