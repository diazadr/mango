<?php

namespace App\Models\Machine;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineReservationCancellation extends Model
{
    use HasFactory;

    protected $fillable = [
        'machine_reservation_id',
        'requested_by_user_id',
        'reason',
        'status',
        'responded_by_user_id',
        'response_notes',
        'previous_status',
    ];

    public function reservation()
    {
        return $this->belongsTo(MachineReservation::class, 'machine_reservation_id');
    }

    public function requestedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'requested_by_user_id');
    }

    public function respondedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'responded_by_user_id');
    }
}
