<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$machine = App\Models\Umkm\MachineManual::first();

if ($machine) {
    echo "Machine ID: " . $machine->id . "\n";
    echo "UMKM ID: " . $machine->umkm_id . "\n";
    $umkm = $machine->umkm;
    if ($umkm) {
        echo "UMKM exists. User ID: " . $umkm->user_id . "\n";
    } else {
        echo "UMKM relationship returned null!\n";
    }
} else {
    echo "No machines found in the database.\n";
}
