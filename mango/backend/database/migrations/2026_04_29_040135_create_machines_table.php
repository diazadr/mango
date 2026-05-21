<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->morphs('owner');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('code')->nullable()->unique();
            $table->string('type')->nullable();
            $table->string('brand')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_iot_enabled')->default(false);
            $table->boolean('is_reservable')->default(false);
            $table->string('status')->default('available'); // available, maintenance, used
            $table->json('specifications')->nullable();
            $table->decimal('hourly_rate', 15, 2)->nullable();

            // Inventory / Asset fields
            $table->integer('quantity')->default(1);
            $table->string('condition')->default('good'); // good, fair, poor
            $table->integer('purchase_year')->nullable();
            $table->date('last_maintenance_at')->nullable();
            $table->integer('maintenance_interval_days')->nullable();
            $table->integer('power_consumption_watt')->nullable();
            $table->string('dimensions')->nullable();
            $table->decimal('weight_kg', 10, 2)->nullable();
            $table->text('notes')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};
