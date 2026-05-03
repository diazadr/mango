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
        Schema::create('machine_manuals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_id')->constrained('umkms')->cascadeOnDelete();
            $table->string('machine_name');
            $table->string('brand')->nullable();
            $table->integer('power_consumption')->nullable();
            $table->integer('purchase_year')->nullable();
            $table->date('last_maintenance_at')->nullable();
            $table->integer('maintenance_interval')->nullable();
            $table->string('dimensions')->nullable();
            $table->decimal('weight', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->integer('quantity')->default(1);
            $table->string('condition')->default('good'); // good, fair, poor
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_manuals');
    }
};
