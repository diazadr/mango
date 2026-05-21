<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_monthly_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('umkm_id')->constrained('umkms')->cascadeOnDelete();
            $table->smallInteger('year');
            $table->smallInteger('month');
            $table->integer('total_good_qty')->default(0);
            $table->integer('total_reject_qty')->default(0);
            $table->decimal('avg_oee_percent', 5, 2)->default(0);
            $table->decimal('growth_percent', 8, 2)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['umkm_id', 'year', 'month'], 'prod_monthly_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_monthly_summaries');
    }
};
