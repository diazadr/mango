<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessment_categories', function (Blueprint $table) {
            if (!Schema::hasColumn('assessment_categories', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('order');
            }
        });

        Schema::table('questions', function (Blueprint $table) {
            if (!Schema::hasColumn('questions', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('order');
            }
        });
    }

    public function down(): void
    {
        Schema::table('assessment_categories', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
