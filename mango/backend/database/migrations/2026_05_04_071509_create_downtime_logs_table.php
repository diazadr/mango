<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // downtime_logs already exists from 2026_05_04_050117 migration
        // This migration is a no-op — the earlier migration already created the table
        if (!Schema::hasTable('downtime_logs')) {
            Schema::create('downtime_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
                $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete();
                $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete();
                $table->enum('source', ['edge', 'manual'])->default('manual');
                $table->datetime('started_at');
                $table->datetime('ended_at')->nullable();
                $table->decimal('duration_min', 8, 2)->nullable();
                $table->string('reason_code', 50)->default('OTHER');
                $table->text('description')->nullable();
                $table->boolean('is_planned')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('downtime_logs');
    }
};
