<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('erp_bom_lines')) {
            Schema::create('erp_bom_lines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('bom_id')->constrained('erp_bom_headers')->cascadeOnDelete();
                $table->string('material_name');
                $table->string('material_sku', 100)->nullable();
                $table->decimal('quantity', 12, 3);
                $table->string('unit', 50)->default('pcs');
                $table->text('notes')->nullable();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_bom_lines');
    }
};
