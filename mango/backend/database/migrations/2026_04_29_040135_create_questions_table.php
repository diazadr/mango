<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_category_id')->constrained('assessment_categories')->cascadeOnDelete();
            $table->text('text');
            $table->string('type')->default('multiple_choice');
            $table->json('options')->nullable();
            $table->decimal('weight', 5, 2)->default(0);
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
