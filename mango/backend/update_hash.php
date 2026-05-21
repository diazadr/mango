<?php

$site = \App\Models\Edge\EdgeSite::first();
if ($site) {
    $site->api_key_hash = hash('sha256', 'cnc-edge-secret-key-2024');
    $site->save();
    echo "OK - Updated Edge Site ID: " . $site->id . "\n";
} else {
    echo "No edge site found.\n";
}
