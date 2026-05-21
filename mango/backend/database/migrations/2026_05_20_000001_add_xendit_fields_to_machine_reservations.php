<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('machine_reservations', function (Blueprint $table) {
            // Xendit Invoice fields
            $table->string('xendit_invoice_id')->nullable()->after('paid_at')
                ->comment('Xendit invoice ID (inv_xxx)');
            $table->string('xendit_invoice_url')->nullable()->after('xendit_invoice_id')
                ->comment('Xendit hosted payment page URL');
            $table->string('xendit_payment_method')->nullable()->after('xendit_invoice_url')
                ->comment('Payment method used on Xendit: BCA/BNI/QRIS/OVO/etc');
            $table->decimal('xendit_paid_amount', 15, 2)->nullable()->after('xendit_payment_method')
                ->comment('Amount actually paid via Xendit');
            $table->timestamp('xendit_expires_at')->nullable()->after('xendit_paid_amount')
                ->comment('Xendit invoice expiry time');
        });
    }

    public function down(): void
    {
        Schema::table('machine_reservations', function (Blueprint $table) {
            $table->dropColumn([
                'xendit_invoice_id',
                'xendit_invoice_url',
                'xendit_payment_method',
                'xendit_paid_amount',
                'xendit_expires_at',
            ]);
        });
    }
};
