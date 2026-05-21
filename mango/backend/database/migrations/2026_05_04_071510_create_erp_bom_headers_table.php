<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('erp_bom_headers')) {
            Schema::create('erp_bom_headers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('erp_products')->cascadeOnDelete();
                $table->string('version', 20)->default('1.0');
                $table->boolean('is_active')->default(true);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_bom_headers');
    }
};
