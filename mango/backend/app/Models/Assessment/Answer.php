<?php

namespace App\Models\Assessment;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Answer extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_result_id',
        'question_id',
        'value',
        'score',
    ];

    protected $casts = [
        'score' => 'float',
    ];

    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
