<?php

namespace App\Models\Mentoring;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConsultationSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_request_id',
        'scheduled_at',
        'duration_minutes',
        'medium',
        'status',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'duration_minutes' => 'integer',
    ];

    public function consultationRequest(): BelongsTo
    {
        return $this->belongsTo(ConsultationRequest::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ConsultationNote::class);
    }
}
