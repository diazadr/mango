<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('erp_mes_alarm_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->nullable()->constrained('erp_mes_work_orders')->nullOnDelete();
            $table->foreignId('machine_id')->nullable()->constrained('machines')->nullOnDelete();
            $table->foreignId('institution_id')->nullable()->constrained('institutions')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('umkm_id')->nullable()->constrained('umkms')->nullOnDelete();
            $table->string('code', 100);
            $table->text('message');
            $table->string('severity', 50)->default('info');
            $table->string('status', 20)->default('open');
            $table->timestampTz('occurred_at')->nullable()->index();
            $table->timestampTz('resolved_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_mes_alarm_events');
    }
};
