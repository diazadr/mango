<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Menambahkan kolom untuk mencatat kategori assessment yang diperbaiki
     * dan rekomendasi spesifik dari sesi pendampingan.
     */
    public function up(): void
    {
        Schema::table('consultation_notes', function (Blueprint $table) {
            // Kategori-kategori assessment yang dibahas/diperbaiki dalam sesi ini (JSON array of category ids)
            $table->json('improved_categories')->nullable()->after('content')
                ->comment('Array of assessment category IDs that were improved in this session');

            // Ringkasan output/deliverable dari sesi pendampingan
            $table->text('session_output')->nullable()->after('improved_categories')
                ->comment('Summary of what was achieved/output from this mentoring session');

            // Flag apakah sesi ini menghasilkan perbaikan yang terukur
            $table->boolean('has_measurable_impact')->default(false)->after('session_output');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consultation_notes', function (Blueprint $table) {
            $table->dropColumn(['improved_categories', 'session_output', 'has_measurable_impact']);
        });
    }
};
