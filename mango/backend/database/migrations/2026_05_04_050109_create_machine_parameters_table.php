<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('machine_parameters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            $table->string('key', 100);
            $table->string('value', 500);
            $table->string('unit', 50)->nullable();
            $table->timestamps();
            $table->unique(['machine_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machine_parameters');
    }
};
