<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('erp_products', function (Blueprint $table) {
            $table->id();
            $table->morphs('owner');
            $table->foreignId('umkm_product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('name');
            $table->string('sku')->nullable();
            $table->string('unit', 50)->default('pcs');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_products');
    }
};
