<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_id')->constrained('umkms')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignId('bom_id')->nullable();
            $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('code')->unique();
            $table->integer('target_qty');
            $table->unsignedInteger('quantity_planned')->default(1);
            $table->string('status', 20)->default('draft');
            $table->date('planned_start');
            $table->date('planned_end');
            $table->timestamp('actual_start')->nullable();
            $table->timestamp('actual_end')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['umkm_id', 'status']);
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
