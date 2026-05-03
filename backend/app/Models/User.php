<?php

namespace App\Models;

use App\Models\Assessment\AssessmentResult;
use App\Models\Master\Department;
use App\Models\Master\Institution;
use App\Models\Master\InstitutionUser;
use App\Models\Master\Organization;
use App\Models\Master\OrganizationUser;
use App\Models\Mentoring\ConsultationNote;
use App\Models\Mentoring\ConsultationRequest;
use App\Models\Mentoring\MentorAssignment;
use App\Models\Umkm\Umkm;
use Database\Factories\UserFactory;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia, MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, InteractsWithMedia, LogsActivity, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'nik',
        'dob',
        'is_active',
        'settings',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatars')
            ->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(400)
            ->height(400)
            ->sharpen(10);

        $this->addMediaConversion('large')
            ->width(800)
            ->height(800)
            ->sharpen(5);
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new \App\Notifications\Auth\CustomVerifyEmail());
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\Auth\CustomResetPassword($token));
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'dob' => 'date',
            'settings' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function institutions(): BelongsToMany
    {
        return $this->belongsToMany(
            Institution::class,
            'institution_user',
            'user_id',
            'institution_id'
        )
            ->using(InstitutionUser::class)
            ->withPivot(['id', 'department_id', 'is_active', 'joined_at'])
            ->withTimestamps()
            ->wherePivot('is_active', true);
    }

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(
            Organization::class,
            'organization_user',
            'user_id',
            'organization_id'
        )
            ->using(OrganizationUser::class)
            ->withPivot(['id', 'is_active', 'joined_at'])
            ->withTimestamps()
            ->wherePivot('is_active', true);
    }

    public function departmentIn(Institution $institution): ?Department
    {
        $pivot = $this->institutions()
            ->where('institutions.id', $institution->id)
            ->first()?->pivot;

        if (! $pivot?->department_id) {
            return null;
        }

        return Department::find($pivot->department_id);
    }

    public function rolesInInstitution(Institution $institution): Collection
    {
        return $this->roles()
            ->where(
                config('permission.column_names.team_foreign_key'),
                $institution->id
            )
            ->get();
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function umkm(): HasOne
    {
        return $this->hasOne(Umkm::class);
    }

    public function assessmentResults(): HasMany
    {
        return $this->hasMany(AssessmentResult::class);
    }

    public function consultationRequests(): HasMany
    {
        return $this->hasMany(ConsultationRequest::class);
    }

    public function mentorAssignments(): HasMany
    {
        return $this->hasMany(MentorAssignment::class, 'mentor_user_id');
    }

    public function consultationNotes(): HasMany
    {
        return $this->hasMany(ConsultationNote::class, 'author_id');
    }
}
