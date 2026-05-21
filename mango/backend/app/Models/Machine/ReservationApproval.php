<?php

namespace App\Models\Machine;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservationApproval extends Model
{
    protected $fillable = [
        'reservation_id',   // FK → machine_reservations.id
        'user_id',          // FK → users.id (the approver)
        'status',           // approved | rejected
        'notes',            // optional comment
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(MachineReservation::class, 'reservation_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
