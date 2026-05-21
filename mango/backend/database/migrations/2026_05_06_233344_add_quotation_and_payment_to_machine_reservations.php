<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('machine_reservations', function (Blueprint $table) {
            // Quotation / RFQ
            $table->decimal('quoted_price', 15, 2)->nullable()->after('rejection_reason')
                ->comment('Final quoted price from machine owner');
            $table->text('quotation_notes')->nullable()->after('quoted_price')
                ->comment('Notes from machine owner when setting quotation');

            // Payment
            $table->string('payment_status')->default('unpaid')->after('quotation_notes')
                ->comment('unpaid, awaiting_confirmation, paid, refunded');
            $table->string('payment_method')->nullable()->after('payment_status')
                ->comment('transfer, cash, etc');
            $table->text('payment_notes')->nullable()->after('payment_method');
            $table->timestamp('paid_at')->nullable()->after('payment_notes');
        });
    }

    public function down(): void
    {
        Schema::table('machine_reservations', function (Blueprint $table) {
            $table->dropColumn([
                'quoted_price',
                'quotation_notes',
                'payment_status',
                'payment_method',
                'payment_notes',
                'paid_at',
            ]);
        });
    }
};
