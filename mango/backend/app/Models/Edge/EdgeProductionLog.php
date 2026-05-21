<?php

namespace App\Models\Edge;

use App\Models\Machine\Machine;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EdgeProductionLog extends Model
{
    protected $fillable = [
        'site_id',
        'machine_id',
        'machine_code',
        'work_order',
        'part_number',
        'shift',
        'operator_id',
        'good_quantity',
        'defect_quantity',
        'actual_cycle_time',
        'operating_time_min',
        'downtime_min',
        'downtime_category',
        'oee_percentage',
        'availability',
        'performance',
        'quality',
        'recorded_at',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'payload' => 'array',
            'actual_cycle_time' => 'decimal:3',
            'operating_time_min' => 'decimal:2',
            'downtime_min' => 'decimal:2',
            'oee_percentage' => 'decimal:2',
            'availability' => 'decimal:2',
            'performance' => 'decimal:2',
            'quality' => 'decimal:2',
        ];
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
}
