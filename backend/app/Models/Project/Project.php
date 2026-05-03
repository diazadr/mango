<?php

namespace App\Models\Project;

use App\Models\Assessment\AssessmentResult;
use App\Models\Umkm\Umkm;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'umkm_id',
        'assessment_result_id',
        'name',
        'type',
        'status',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'started_at' => 'date',
        'ended_at' => 'date',
    ];

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(Umkm::class);
    }

    public function assessmentResult(): BelongsTo
    {
        return $this->belongsTo(AssessmentResult::class);
    }

    public function iterations(): HasMany
    {
        return $this->hasMany(Iteration::class)->orderBy('order');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ProjectNote::class);
    }
}
