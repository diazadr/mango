<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('downtime_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_order_id')->constrained('job_orders')->cascadeOnDelete();
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            $table->string('reason', 500);
            $table->string('category', 20);
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->timestamps();
            $table->index(['machine_id', 'started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('downtime_logs');
    }
};
