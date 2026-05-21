<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            $table->string('event_type', 100);
            $table->json('payload');
            $table->timestamp('recorded_at');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['machine_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_events');
    }
};
