<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('work_order_operations')) {
            Schema::create('work_order_operations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('work_order_id')->constrained('work_orders')->cascadeOnDelete();
                $table->unsignedSmallInteger('sequence')->default(1);
                $table->string('operation_name');
                $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
                $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete();
                $table->unsignedInteger('planned_duration_min')->nullable();
                $table->unsignedInteger('actual_duration_min')->nullable();
                $table->enum('status', ['pending', 'in_progress', 'done', 'skipped'])->default('pending');
                $table->datetime('started_at')->nullable();
                $table->datetime('completed_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('work_order_operations');
    }
};
