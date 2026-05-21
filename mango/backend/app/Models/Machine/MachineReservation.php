<?php

namespace App\Models\Machine;

use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MachineReservation extends Model implements HasMedia
{
    use SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'machine_id',
        'requester_umkm_id',
        'requested_by_user_id',
        'start_time',
        'end_time',
        'purpose',
        'status',
        'rejection_reason',
        // Quotation
        'quoted_price',
        'quotation_notes',
        // Payment
        'payment_status',
        'payment_method',
        'payment_notes',
        'paid_at',
        // Xendit
        'xendit_invoice_id',
        'xendit_invoice_url',
        'xendit_payment_method',
        'xendit_paid_amount',
        'xendit_expires_at',
    ];

    protected $casts = [
        'start_time'    => 'datetime',
        'end_time'      => 'datetime',
        'paid_at'            => 'datetime',
        'quoted_price'       => 'decimal:2',
        'xendit_paid_amount' => 'decimal:2',
        'xendit_expires_at'  => 'datetime',
    ];

    /**
     * Design files uploaded by requester (CAD, PDF, ZIP, etc.)
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('design_files')
            ->acceptsMimeTypes([
                'application/pdf',
                'application/zip',
                'application/x-zip-compressed',
                'application/octet-stream', // STEP, IGES, STL
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);

        $this->addMediaCollection('payment_proofs')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')->width(400)->height(400)->nonQueued();
            });
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function requesterUmkm(): BelongsTo
    {
        return $this->belongsTo(Umkm::class, 'requester_umkm_id');
    }

    public function requesterUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(ReservationApproval::class, 'reservation_id');
    }

    public function negotiations(): HasMany
    {
        return $this->hasMany(MachineReservationNegotiation::class, 'machine_reservation_id');
    }

    public function cancellations(): HasMany
    {
        return $this->hasMany(MachineReservationCancellation::class, 'machine_reservation_id');
    }

    public function activeCancellation(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MachineReservationCancellation::class, 'machine_reservation_id')->where('status', 'pending');
    }

    /**
     * Duration in hours between start_time and end_time.
     */
    public function getDurationHoursAttribute(): float
    {
        if (!$this->start_time || !$this->end_time) return 0;
        return max(0, $this->start_time->diffInMinutes($this->end_time) / 60);
    }
}
