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
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('assessment_categories')->cascadeOnDelete();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->string('status')->default('completed');
            $table->string('level')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_mentoring_result')->default(false); // Hasil duplikasi dari proses mentoring
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_results');
    }
};
