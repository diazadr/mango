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
        Schema::create('consultation_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_request_id')->constrained()->onDelete('cascade');
            $table->timestamp('scheduled_at');
            $table->integer('duration_minutes')->nullable();
            $table->string('medium', 20);
            $table->string('status', 20)->default('scheduled'); // scheduled, completed, missed, cancelled
            $table->string('meeting_link', 500)->nullable();
            $table->string('location', 255)->nullable();
            $table->boolean('is_no_show')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_sessions');
    }
};
