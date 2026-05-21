<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('consultation_request_id')
                ->nullable()
                ->after('assessment_result_id')
                ->constrained('consultation_requests')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['consultation_request_id']);
            $table->dropColumn('consultation_request_id');
        });
    }
};
