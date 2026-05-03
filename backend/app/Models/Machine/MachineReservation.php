<?php

namespace App\Models\Machine;

use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MachineReservation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'machine_id',
        'requester_umkm_id',
        'requested_by_user_id',
        'start_time',
        'end_time',
        'purpose',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

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
}
