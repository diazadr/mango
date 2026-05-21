<?php

namespace App\Models\Mes;

use App\Models\Erp\WorkOrder;
use App\Models\Machine\Machine;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DowntimeLog extends Model
{
    protected $fillable = [
        'machine_id', 'work_order_id', 'operator_id',
        'source', 'started_at', 'ended_at', 'duration_min',
        'reason_code', 'description', 'is_planned',
    ];

    protected function casts(): array
    {
        return [
            'started_at'   => 'datetime',
            'ended_at'     => 'datetime',
            'duration_min' => 'decimal:2',
            'is_planned'   => 'boolean',
        ];
    }

    /** Hitung duration_min otomatis saat ended_at diisi */
    protected static function booted(): void
    {
        static::saving(function (self $log) {
            if ($log->ended_at && $log->started_at && !$log->duration_min) {
                $log->duration_min = round(
                    $log->started_at->diffInSeconds($log->ended_at) / 60,
                    2
                );
            }
        });
    }

    public function machine(): BelongsTo { return $this->belongsTo(Machine::class); }
    public function workOrder(): BelongsTo { return $this->belongsTo(WorkOrder::class); }

    public static function reasonCodeLabel(string $code): string
    {
        return match($code) {
            'BREAKDOWN'      => 'Kerusakan Mesin',
            'SETUP'          => 'Setup & Penyesuaian',
            'MINOR_STOP'     => 'Berhenti Sebentar',
            'REDUCED_SPEED'  => 'Kecepatan Berkurang',
            'PROCESS_DEFECT' => 'Cacat Proses',
            'REWORK'         => 'Pengerjaan Ulang',
            default          => 'Lainnya',
        };
    }
}
