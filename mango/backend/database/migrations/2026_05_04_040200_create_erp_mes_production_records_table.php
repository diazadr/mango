<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('erp_mes_production_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->nullable()->constrained('erp_mes_work_orders')->nullOnDelete();
            $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
            $table->foreignId('institution_id')->nullable()->constrained('institutions')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('umkm_id')->nullable()->constrained('umkms')->nullOnDelete();
            $table->foreignId('operator_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('shift')->nullable();
            $table->unsignedInteger('good_quantity')->default(0);
            $table->unsignedInteger('reject_quantity')->default(0);
            $table->string('reject_reason')->nullable();
            $table->decimal('cycle_time_actual', 10, 3)->nullable();
            $table->decimal('operating_time_min', 10, 2)->nullable();
            $table->decimal('downtime_min', 10, 2)->nullable();
            $table->timestampTz('recorded_at')->nullable()->index();
            $table->string('source')->default('manual');
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_mes_production_records');
    }
};
