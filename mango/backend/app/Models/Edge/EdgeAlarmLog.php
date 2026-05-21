<?php

namespace App\Models\Edge;

use App\Models\Machine\Machine;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EdgeAlarmLog extends Model
{
    protected $fillable = [
        'site_id',
        'machine_id',
        'machine_code',
        'alarm_code',
        'message',
        'severity',
        'occurred_at',
        'resolved_at',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'resolved_at' => 'datetime',
            'payload' => 'array',
        ];
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
}
