<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edge_alarm_logs', function (Blueprint $table) {
            $table->id();
            $table->string('site_id');
            $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
            $table->string('machine_code')->index();
            $table->string('alarm_code', 100);
            $table->text('message');
            $table->string('severity', 50);
            $table->timestampTz('occurred_at')->index();
            $table->timestampTz('resolved_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edge_alarm_logs');
    }
};
