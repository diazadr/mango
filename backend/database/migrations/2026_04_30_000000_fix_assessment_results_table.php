<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessment_results', function (Blueprint $table) {
            // Rename score to total_score if score exists
            if (Schema::hasColumn('assessment_results', 'score')) {
                $table->renameColumn('score', 'total_score');
            }

            // Add level if not exists
            if (!Schema::hasColumn('assessment_results', 'level')) {
                $table->string('level')->nullable()->after('status');
            }

            // Add submitted_at if not exists
            if (!Schema::hasColumn('assessment_results', 'submitted_at')) {
                $table->timestamp('submitted_at')->nullable()->after('updated_at');
            }

            // Make category_id nullable
            $table->unsignedBigInteger('category_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('assessment_results', function (Blueprint $table) {
            $table->renameColumn('total_score', 'score');
            $table->dropColumn(['level', 'submitted_at']);
            $table->unsignedBigInteger('category_id')->nullable(false)->change();
        });
    }
};
