<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oee_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            $table->date('date');
            $table->decimal('availability', 5, 2)->default(0);
            $table->decimal('performance', 5, 2)->default(0);
            $table->decimal('quality', 5, 2)->default(0);
            $table->decimal('oee', 5, 2)->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['machine_id', 'date'], 'oee_machine_date_unique');
            $table->index(['machine_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oee_summaries');
    }
};
