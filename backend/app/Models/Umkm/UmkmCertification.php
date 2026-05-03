<?php

namespace App\Models\Umkm;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class UmkmCertification extends Model implements HasMedia
{
    use InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'umkm_id',
        'name',
        'certificate_number',
        'issued_date',
        'expiry_date',
    ];

    protected $casts = [
        'issued_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty();
    }

    public function umkm()
    {
        return $this->belongsTo(Umkm::class);
    }
}
