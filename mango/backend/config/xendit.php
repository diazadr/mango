<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Xendit API Key
    |--------------------------------------------------------------------------
    | Secret key dari Xendit dashboard (Money-in Write, VA Write, E-wallet Write)
    */
    'secret_key' => env('XENDIT_SECRET_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Xendit Webhook Verification Token
    |--------------------------------------------------------------------------
    | Token yang diset di Xendit dashboard untuk verifikasi webhook callback.
    | Settings > Webhooks > Verification Token
    */
    'webhook_token' => env('XENDIT_WEBHOOK_TOKEN', ''),

    /*
    |--------------------------------------------------------------------------
    | Payment Methods yang diaktifkan
    |--------------------------------------------------------------------------
    */
    'payment_methods' => ['BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA', 'QRIS', 'OVO', 'DANA', 'LINKAJA'],

    /*
    |--------------------------------------------------------------------------
    | Success & Failure Redirect URL (setelah user bayar)
    |--------------------------------------------------------------------------
    */
    'success_redirect_url' => env('XENDIT_SUCCESS_REDIRECT_URL', env('FRONTEND_URL') . '/id/workspace/reservations/history'),
    'failure_redirect_url' => env('XENDIT_FAILURE_REDIRECT_URL', env('FRONTEND_URL') . '/id/workspace/reservations/history'),

    /*
    |--------------------------------------------------------------------------
    | Invoice Expiry (jam)
    |--------------------------------------------------------------------------
    */
    'invoice_expiry_hours' => env('XENDIT_INVOICE_EXPIRY_HOURS', 24),
];
