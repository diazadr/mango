<?php

namespace App\Models\Assessment;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'weight',
        'order',
        'is_active',
    ];

    protected $casts = [
        'weight' => 'float',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
