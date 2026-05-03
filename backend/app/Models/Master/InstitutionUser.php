<?php

namespace App\Models\Master;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class InstitutionUser extends Pivot
{
    protected $table = 'institution_user';

    public $incrementing = true;

    protected $fillable = [
        'institution_id',
        'user_id',
        'department_id',
        'is_active',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'joined_at' => 'datetime',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
