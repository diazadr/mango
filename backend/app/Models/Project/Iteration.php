<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Iteration extends Model
{
    protected $fillable = [
        'project_id',
        'name',
        'order',
        'status',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'started_at' => 'date',
        'ended_at' => 'date',
        'order' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function actionPlans(): HasMany
    {
        return $this->hasMany(ActionPlan::class);
    }

    public function deliverables(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(Deliverable::class, ActionPlan::class);
    }
}
