<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('erp_mes_work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
            $table->foreignId('institution_id')->nullable()->constrained('institutions')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('umkm_id')->nullable()->constrained('umkms')->nullOnDelete();
            $table->string('title');
            $table->string('part_number')->nullable();
            $table->unsignedInteger('target_quantity')->default(0);
            $table->unsignedInteger('completed_quantity')->default(0);
            $table->unsignedInteger('reject_quantity')->default(0);
            $table->string('priority')->default('normal');
            $table->string('status')->default('draft');
            $table->unsignedTinyInteger('shift')->nullable();
            $table->string('source')->default('manual');
            $table->text('notes')->nullable();
            $table->timestampTz('planned_start_at')->nullable();
            $table->timestampTz('planned_end_at')->nullable();
            $table->timestampTz('actual_start_at')->nullable();
            $table->timestampTz('actual_end_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_mes_work_orders');
    }
};
