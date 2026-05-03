<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = App\Models\User::where('email', 'umkm@gmail.com')->first();
$umkm = App\Models\Umkm\Umkm::first();

echo "User ID: {$user->id}\n";
echo "Umkm User ID: {$umkm->user_id}\n";
echo "Is user id strictly equal to umkm user id? " . ($user->id === $umkm->user_id ? 'Yes' : 'No') . "\n";
echo "gettype user id: " . gettype($user->id) . "\n";
echo "gettype umkm user id: " . gettype($umkm->user_id) . "\n";

$policy = new App\Policies\UmkmPolicy();
echo "Policy update method direct call: " . ($policy->update($user, $umkm) ? 'True' : 'False') . "\n";
