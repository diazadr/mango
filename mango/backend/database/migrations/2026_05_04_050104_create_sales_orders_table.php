<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_id')->constrained('umkms')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('customer_name');
            $table->string('status', 20)->default('draft');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->date('ordered_at');
            $table->timestamps();
            $table->index(['umkm_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_orders');
    }
};
