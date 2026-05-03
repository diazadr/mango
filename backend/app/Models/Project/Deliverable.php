<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deliverable extends Model
{
    protected $fillable = [
        'action_plan_id',
        'title',
        'description',
        'file_path',
        'url',
    ];

    public function iteration()
    {
        return $this->hasOneThrough(Iteration::class, ActionPlan::class, 'id', 'id', 'action_plan_id', 'iteration_id');
    }

    public function actionPlan(): BelongsTo
    {
        return $this->belongsTo(ActionPlan::class);
    }
}
