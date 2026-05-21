<?php

namespace App\Models\Assessment;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_result_id',
        'assessment_category_id',
        'gap_score',
        'priority',
        'recommendation_text',
    ];

    protected $casts = [
        'gap_score' => 'float',
    ];

    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssessmentCategory::class, 'assessment_category_id');
    }
}
