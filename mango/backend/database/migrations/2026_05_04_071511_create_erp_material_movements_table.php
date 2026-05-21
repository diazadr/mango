<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('erp_material_movements')) {
            Schema::create('erp_material_movements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('material_id')->constrained('erp_materials')->cascadeOnDelete();
                $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete();
                $table->enum('type', ['in', 'out', 'adjustment', 'return']);
                $table->decimal('quantity', 12, 3);
                $table->decimal('qty_before', 12, 3)->default(0);
                $table->decimal('qty_after', 12, 3)->default(0);
                $table->string('reference', 255)->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_material_movements');
    }
};
