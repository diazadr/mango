<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::first();
if ($user) {
    try {
        $user->sendEmailVerificationNotification();
        echo "Email sent successfully.\n";
    } catch (\Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
        echo $e->getTraceAsString() . "\n";
    }
} else {
    echo "No user found.\n";
}
