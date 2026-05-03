<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('answers', function (Blueprint $table) {
            if (!Schema::hasColumn('answers', 'value')) {
                $table->string('value')->nullable()->after('question_id');
            }
            if (!Schema::hasColumn('answers', 'score')) {
                $table->decimal('score', 5, 2)->default(0)->after('value');
            }
        });
    }

    public function down(): void
    {
        Schema::table('answers', function (Blueprint $table) {
            $table->dropColumn(['value', 'score']);
        });
    }
};
