<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('machine_reservation_negotiations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_reservation_id')->constrained('machine_reservations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('offered_price', 15, 2);
            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, accepted, rejected, superseded
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_reservation_negotiations');
    }
};
