<?php

namespace App\Models\Master;

use App\Traits\BelongsToInstitution;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Department extends Model
{
    use BelongsToInstitution, HasFactory, SoftDeletes;

    protected $fillable = [
        'institution_id',
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $dept) {
            if (empty($dept->slug)) {
                $dept->slug = Str::slug($dept->name);
            }
        });

        static::updating(function (self $dept) {
            if ($dept->isDirty('name') && ! $dept->isDirty('slug')) {
                $dept->slug = Str::slug($dept->name);
            }
        });
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function institutionUsers(): HasMany
    {
        return $this->hasMany(OrganizationUser::class, 'department_id');
    }
}
