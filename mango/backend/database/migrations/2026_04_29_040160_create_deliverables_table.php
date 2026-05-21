<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('action_plan_id')->constrained('action_plans')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->string('file_disk', 20)->nullable()->default('local'); // 'local' = private, 'public' = public
            $table->string('file_mime', 100)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->string('url', 500)->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliverables');
    }
};
