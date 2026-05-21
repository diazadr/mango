<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = [
    'users', 'umkms', 'institutions',
    'assessment_results', 'recommendations',
    'consultation_requests', 'consultation_sessions',
    'projects', 'iterations', 'action_plans',
    'machines', 'machine_reservations'
];
$schema = [];
foreach($tables as $table) {
    $columns = \Illuminate\Support\Facades\Schema::getColumnListing($table);
    $schema[$table] = $columns;
}
echo json_encode($schema);
