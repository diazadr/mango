<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('erp_materials')) {
            Schema::create('erp_materials', function (Blueprint $table) {
                $table->id();
                $table->morphs('owner');
                $table->string('name');
                $table->string('sku', 100)->nullable();
                $table->string('unit', 50)->default('pcs');
                $table->decimal('stock_qty', 12, 3)->default(0);
                $table->decimal('minimum_stock', 12, 3)->default(0);
                $table->decimal('reorder_point', 12, 3)->default(0);
                $table->string('location', 255)->nullable();
                $table->text('notes')->nullable();
                $table->softDeletes();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_materials');
    }
};
