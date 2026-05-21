<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('erp_products', function (Blueprint $table) {
            $table->boolean('is_saleable')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('erp_products', function (Blueprint $table) {
            $table->dropColumn('is_saleable');
        });
    }
};
