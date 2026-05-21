<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edge_sites', function (Blueprint $table) {
            $table->id();
            $table->string('name');                          // "Pabrik Bandung"
            $table->string('site_id')->unique();             // "FACTORY_001"
            $table->string('api_key_hash');                  // SHA-256 of the real key
            $table->string('api_key_preview', 12);          // first 8 chars + "****" for display
            $table->text('description')->nullable();
            $table->string('location')->nullable();          // "Jl. Merdeka No.1, Bandung"
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('machine_count')->default(0);
            $table->timestamp('last_sync_at')->nullable();  // updated on every push
            $table->nullableMorphs('owner');                 // institution / organization / umkm

            // FK shorthand
            $table->foreignId('institution_id')->nullable()->constrained('institutions')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->foreignId('umkm_id')->nullable()->constrained('umkms')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edge_sites');
    }
};
