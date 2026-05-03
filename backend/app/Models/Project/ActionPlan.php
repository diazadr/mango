<?php

namespace App\Models\Project;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActionPlan extends Model
{
    protected $fillable = [
        'iteration_id',
        'title',
        'description',
        'pic_user_id',
        'due_date',
        'status',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function iteration(): BelongsTo
    {
        return $this->belongsTo(Iteration::class);
    }

    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_user_id');
    }

    public function deliverables(): HasMany
    {
        return $this->hasMany(Deliverable::class);
    }
}
