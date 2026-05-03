<?php
$user = \App\Models\User::find(3);
echo json_encode([
    'user_id' => $user->id,
    'exists' => $user->organizations()->where('organizations.id', 1)->exists(),
    'all_orgs' => $user->organizations()->get()->pluck('id')
]);
