<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_id')->constrained('umkms')->cascadeOnDelete();
            $table->string('name');
            $table->string('sku', 100);
            $table->string('unit', 50);
            $table->decimal('cost_per_unit', 15, 2)->default(0);
            $table->timestamps();
            $table->unique(['umkm_id', 'sku']);
            $table->index('umkm_id');
            $table->index('sku');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
