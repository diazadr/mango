<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->nullable()->constrained('institutions')->nullOnDelete();
            $table->foreignId('umkm_id')->constrained('umkms')->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('topic');
            $table->text('description');
            $table->string('status')->default('pending'); // pending, assigned, ongoing, done, cancelled
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_requests');
    }
};
