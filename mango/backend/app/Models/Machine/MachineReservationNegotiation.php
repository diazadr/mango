<?php

namespace App\Models\Machine;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MachineReservationNegotiation extends Model
{
    use HasFactory;

    protected $fillable = [
        'machine_reservation_id',
        'user_id',
        'offered_price',
        'notes',
        'status',
    ];

    public function reservation()
    {
        return $this->belongsTo(MachineReservation::class, 'machine_reservation_id');
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
