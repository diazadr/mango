<?php

namespace App\Console\Commands;

use App\Models\Machine\MachineReservation;
use App\Notifications\Reservation\PaymentPaid;
use App\Notifications\Reservation\PaymentReceived;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SimulateXenditPayment extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'xendit:simulate-payment {reservation_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulate a successful Xendit webhook callback for local development';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $reservationId = $this->argument('reservation_id');
        $reservation = MachineReservation::with(['machine.owner', 'requesterUser'])->find($reservationId);

        if (!$reservation) {
            $this->error("Reservation ID {$reservationId} not found.");
            return 1;
        }

        if ($reservation->payment_status === 'paid') {
            $this->warn("Reservation ID {$reservationId} is already paid.");
            return 0;
        }

        DB::transaction(function () use ($reservation) {
            $reservation->update([
                'payment_status'        => 'paid',
                'paid_at'               => now(),
                'xendit_payment_method' => 'SIMULATED_VIRTUAL_ACCOUNT',
                'xendit_paid_amount'    => $reservation->quoted_price,
                'status'                => 'completed', // Direct completion like real webhook
            ]);
        });

        // 1. Ke pemohon
        if ($reservation->requesterUser) {
            $reservation->requesterUser->notify(new PaymentPaid($reservation));
        }

        // 2. Ke pemilik mesin
        $machineOwner = $reservation->machine?->owner;
        if ($machineOwner && method_exists($machineOwner, 'notify')) {
            $machineOwner->notify(new PaymentReceived($reservation));
        }

        $this->info("Successfully simulated Xendit payment for Reservation ID: {$reservationId}");
        return 0;
    }
}
