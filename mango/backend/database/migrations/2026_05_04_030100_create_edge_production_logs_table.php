<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edge_production_logs', function (Blueprint $table) {
            $table->id();
            $table->string('site_id');
            $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
            $table->string('machine_code');
            $table->string('work_order')->nullable()->index();
            $table->string('part_number')->nullable();
            $table->unsignedTinyInteger('shift')->nullable();
            $table->string('operator_id')->nullable();
            $table->unsignedInteger('good_quantity')->default(0);
            $table->unsignedInteger('defect_quantity')->default(0);
            $table->decimal('actual_cycle_time', 10, 3)->nullable();
            $table->decimal('operating_time_min', 10, 2)->nullable();
            $table->decimal('downtime_min', 10, 2)->nullable();
            $table->string('downtime_category')->nullable();
            $table->decimal('oee_percentage', 5, 2)->nullable();
            $table->decimal('availability', 5, 2)->nullable();
            $table->decimal('performance', 5, 2)->nullable();
            $table->decimal('quality', 5, 2)->nullable();
            $table->timestampTz('recorded_at')->index();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edge_production_logs');
    }
};
