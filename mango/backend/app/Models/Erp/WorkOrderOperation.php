<?php

namespace App\Models\Erp;

use App\Models\Machine\Machine;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderOperation extends Model
{
    protected $fillable = [
        'work_order_id', 'sequence', 'operation_name',
        'machine_id', 'operator_id',
        'planned_duration_min', 'actual_duration_min',
        'status', 'started_at', 'completed_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'started_at'   => 'datetime',
            'completed_at' => 'datetime',
            'sequence'     => 'integer',
        ];
    }

    public function workOrder(): BelongsTo { return $this->belongsTo(WorkOrder::class); }
    public function machine(): BelongsTo { return $this->belongsTo(Machine::class); }
    public function operator(): BelongsTo { return $this->belongsTo(User::class, 'operator_id'); }
}
