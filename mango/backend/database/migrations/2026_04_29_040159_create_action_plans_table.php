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
        Schema::create('action_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('iteration_id')->constrained('iterations')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('pic_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->date('due_date')->nullable();
            $table->enum('status', ['todo', 'in_progress', 'done'])->default('todo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('action_plans');
    }
};
