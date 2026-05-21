<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_order_id')->constrained('job_orders')->cascadeOnDelete();
            $table->foreignId('operator_id')->constrained('operators')->cascadeOnDelete();
            $table->integer('good_qty')->default(0);
            $table->integer('reject_qty')->default(0);
            $table->timestamp('logged_at');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['job_order_id', 'logged_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_logs');
    }
};
