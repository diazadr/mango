<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$sessions = DB::table('sessions')->get();
foreach ($sessions as $session) {
    if ($session->user_id) {
        $user = App\Models\User::find($session->user_id);
        echo "Active Session User ID: " . $session->user_id . " Email: " . ($user ? $user->email : 'N/A') . "\n";
    }
}
