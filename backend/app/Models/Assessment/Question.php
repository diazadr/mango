<?php

namespace App\Models\Assessment;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    protected $fillable = [
        'assessment_category_id',
        'text',
        'type',
        'weight',
        'order',
        'is_active',
    ];

    protected $casts = [
        'weight' => 'float',
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssessmentCategory::class, 'assessment_category_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }
}
