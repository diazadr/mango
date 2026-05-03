<?php

namespace App\Models\Umkm;

use App\Models\Assessment\AssessmentResult;
use App\Models\Machine\Machine;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Mentoring\ConsultationRequest;
use App\Models\Project\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Umkm extends Model implements HasMedia
{
    use HasFactory, HasUuids, InteractsWithMedia, LogsActivity, SoftDeletes;

    /**
     * The columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * Booted the model.
     */
    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name).'-'.Str::lower(Str::random(6));
            }
        });
    }

    /**
     * Configure activity logging.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    /**
     * Register media collections.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('logos')
            ->singleFile();

        $this->addMediaCollection('documents');
    }

    /**
     * Register media conversions.
     */
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

    protected $table = 'umkms';

    protected $fillable = [
        'uuid',
        'slug',
        'institution_id',
        'organization_id',
        'user_id',
        'registration_number',
        'name',
        'description',
        'email',
        'phone',
        'address',
        'province',
        'regency',
        'district',
        'village',
        'postal_code',
        'latitude',
        'longitude',
        'sector',
        'nib',
        'established_year',
        'employee_count',
        'legal_entity_type',
        'operating_hours',
        'main_product',
        'market_target',
        'website',
        'is_active',
        'status',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'established_year' => 'integer',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'operating_hours' => 'array',
        ];
    }

    /**
     * The Mentoring Institution (Campus/UPT) that manages this UMKM.
     */
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    /**
     * The UMKM Organization/Paguyuban this UMKM belongs to.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function certificationDocs()
    {
        return $this->hasMany(UmkmCertification::class);
    }

    public function assessmentResults()
    {
        return $this->hasMany(AssessmentResult::class);
    }

    public function consultationRequests()
    {
        return $this->hasMany(ConsultationRequest::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function machines()
    {
        return $this->morphMany(Machine::class, 'owner');
    }

    public function productionCapacities()
    {
        return $this->hasMany(ProductionCapacity::class);
    }

    public function machineManuals()
    {
        return $this->hasMany(MachineManual::class);
    }
}
