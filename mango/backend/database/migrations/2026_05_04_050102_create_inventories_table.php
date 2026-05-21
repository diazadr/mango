<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('umkm_inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_id')->constrained('umkms')->cascadeOnDelete();
            $table->string('item_type', 20); // 'product' | 'material'
            $table->unsignedBigInteger('item_id');
            $table->decimal('qty_on_hand', 12, 3)->default(0);
            $table->decimal('qty_reserved', 12, 3)->default(0);
            $table->timestamps();
            $table->unique(['umkm_id', 'item_id', 'item_type'], 'umkm_inventories_unique');
            $table->index(['umkm_id', 'item_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('umkm_inventories');
    }
};
