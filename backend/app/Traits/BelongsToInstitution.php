<?php

namespace App\Traits;

use App\Models\Master\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToInstitution
{
    protected static function bootBelongsToInstitution(): void
    {
        static::addGlobalScope('institution', function (Builder $builder): void {
            if (! Auth::check()) {
                return;
            }

            $user = Auth::user();

            if ($user->hasRole('super_admin')) {
                return;
            }

            $institutionIds = $user->institutions()->pluck('institutions.id')->values();

            if ($institutionIds->isEmpty()) {
                $builder->whereRaw('1 = 0');

                return;
            }

            $builder->whereIn($builder->qualifyColumn('institution_id'), $institutionIds);
        });

        static::creating(function ($model): void {
            if (! Auth::check() || ! empty($model->institution_id)) {
                return;
            }

            $user = Auth::user();

            if ($user->hasRole('super_admin')) {
                return;
            }

            $model->institution_id = $user->institutions()->value('institutions.id');
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'institution_id');
    }

    public function institution()
    {
        return $this->organization();
    }
}
