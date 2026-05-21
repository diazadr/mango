<?php

namespace App\Models\Assessment;

use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'umkm_id',
        'user_id',
        'total_score',
        'level',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewer_id',
    ];

    protected $casts = [
        'total_score' => 'float',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(Umkm::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class);
    }
}
