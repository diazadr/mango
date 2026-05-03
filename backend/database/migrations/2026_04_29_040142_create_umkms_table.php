<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('umkms', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
$table->foreignId('institution_id')->nullable();
            // Identitas Dasar
            $table->string('registration_number')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();

            // Lokasi Detail
            $table->string('province')->nullable();
            $table->string('regency')->nullable();
            $table->string('district')->nullable();
            $table->string('village')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Detail Bisnis & Legalitas
            $table->string('sector');
            $table->string('nib', 13)->nullable();
            $table->year('established_year');
            $table->string('legal_entity_type')->nullable(); // Perseorangan, CV, PT

            // Finansial & Operasional
            $table->integer('employee_count')->default(0);
            $table->json('operating_hours')->nullable();

            // Profil Bisnis (Merged from BusinessProfile)
            $table->string('main_product')->nullable();
            $table->string('market_target')->nullable();

            // Media Sosial & Marketplace
            $table->string('website')->nullable();

            $table->boolean('is_active')->default(true);
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('rejection_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('umkms');
    }
};
