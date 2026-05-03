<?php

namespace App\Models\Mentoring;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentorAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_request_id',
        'mentor_user_id',
        'assigned_by',
        'assigned_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function consultationRequest(): BelongsTo
    {
        return $this->belongsTo(ConsultationRequest::class);
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_user_id');
    }

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
