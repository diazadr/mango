<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_id')->constrained('umkms')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Added back
            $table->foreignId('category_id')->constrained('assessment_categories')->cascadeOnDelete();
            $table->decimal('score', 5, 2);
            $table->string('status')->default('completed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_results');
    }
};
