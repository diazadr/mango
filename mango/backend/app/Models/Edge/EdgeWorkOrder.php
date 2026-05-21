<?php

namespace App\Models\Edge;

use App\Models\Erp\WorkOrder as ErpWorkOrder;
use App\Models\Machine\Machine;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EdgeWorkOrder extends Model
{
    protected $fillable = [
        'work_order_no',
        'machine_id',
        'machine_code',
        'institution_id',
        'organization_id',
        'umkm_id',
        'part_number',
        'planned_quantity',
        'produced_quantity',
        'shift',
        'status',
        'planned_start_at',
        'planned_end_at',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'planned_start_at' => 'datetime',
            'planned_end_at' => 'datetime',
            'payload' => 'array',
        ];
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(Umkm::class);
    }

    /**
     * Keep edge_work_orders aligned with erp_mes_work_orders for edge pull / CNC sync.
     */
    public static function syncFromErpWorkOrder(ErpWorkOrder $workOrder): void
    {
        $workOrder->loadMissing('machine');

        static::updateOrCreate(
            ['work_order_no' => $workOrder->code],
            [
                'machine_id' => $workOrder->machine_id,
                'machine_code' => $workOrder->machine?->code,
                'institution_id' => $workOrder->institution_id,
                'organization_id' => $workOrder->organization_id,
                'umkm_id' => $workOrder->umkm_id,
                'part_number' => $workOrder->part_number,
                'planned_quantity' => $workOrder->target_quantity,
                'produced_quantity' => $workOrder->completed_quantity,
                'shift' => $workOrder->shift,
                'status' => $workOrder->status,
                'planned_start_at' => $workOrder->planned_start_at,
                'planned_end_at' => $workOrder->planned_end_at,
                'payload' => array_merge((array) ($workOrder->payload ?? []), [
                    'erp_mes_work_order_id' => $workOrder->id,
                ]),
            ]
        );
    }
}
