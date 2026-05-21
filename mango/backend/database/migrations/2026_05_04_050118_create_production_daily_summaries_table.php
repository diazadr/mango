<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_daily_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_id')->constrained('umkms')->cascadeOnDelete();
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            $table->date('date');
            $table->integer('good_qty')->default(0);
            $table->integer('reject_qty')->default(0);
            $table->integer('runtime_minutes')->default(0);
            $table->integer('downtime_minutes')->default(0);
            $table->decimal('oee_percent', 5, 2)->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['umkm_id', 'machine_id', 'date'], 'prod_daily_unique');
            $table->index(['umkm_id', 'date']);
            $table->index(['machine_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_daily_summaries');
    }
};
