<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->morphs('owner');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('code')->unique();
            $table->string('type')->nullable();
            $table->string('brand')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_iot_enabled')->default(false);
            $table->string('status')->default('available'); // available, maintenance, used
            $table->json('specifications')->nullable();
            $table->decimal('hourly_rate', 15, 2)->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};
