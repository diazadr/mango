<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edge_work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('work_order_no')->unique();
            $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
            $table->string('machine_code')->nullable()->index();
            $table->foreignId('institution_id')->nullable()->constrained('institutions')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('umkm_id')->nullable()->constrained('umkms')->nullOnDelete();
            $table->string('part_number')->nullable();
            $table->unsignedInteger('planned_quantity')->default(0);
            $table->unsignedInteger('produced_quantity')->default(0);
            $table->unsignedTinyInteger('shift')->nullable();
            $table->string('status')->default('draft')->index();
            $table->timestampTz('planned_start_at')->nullable();
            $table->timestampTz('planned_end_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edge_work_orders');
    }
};
