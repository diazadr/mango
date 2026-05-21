<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix downtime_logs table schema.
 *
 * The original migration (2026_05_04_050117) created the table with an
 * old schema (job_order_id, reason, category, duration_minutes).
 * The ERP-MES module needs a different schema (work_order_id, reason_code,
 * duration_min, description, is_planned, source, operator_id).
 *
 * Since this is a dev environment, we drop and recreate the table.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Drop the old table entirely so we can recreate with correct schema
        Schema::dropIfExists('downtime_logs');

        Schema::create('downtime_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
            $table->foreignId('work_order_id')->nullable()->constrained('erp_mes_work_orders')->nullOnDelete();
            $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('source', ['edge', 'manual'])->default('manual');
            $table->datetime('started_at');
            $table->datetime('ended_at')->nullable();
            $table->decimal('duration_min', 8, 2)->nullable();
            $table->string('reason_code', 50)->default('OTHER');
            $table->text('description')->nullable();
            $table->boolean('is_planned')->default(false);
            $table->timestamps();

            $table->index(['machine_id', 'started_at']);
            $table->index(['work_order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('downtime_logs');

        // Restore old schema
        Schema::create('downtime_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_order_id')->constrained('job_orders')->cascadeOnDelete();
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            $table->string('reason', 500);
            $table->string('category', 20);
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->timestamps();
        });
    }
};
