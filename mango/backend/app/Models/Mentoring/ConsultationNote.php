<?php

namespace App\Models\Mentoring;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_session_id',
        'author_id',
        'content',
        'improved_categories',
        'session_output',
        'has_measurable_impact',
    ];

    protected $casts = [
        'improved_categories' => 'array',
        'has_measurable_impact' => 'boolean',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(ConsultationSession::class, 'consultation_session_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
