<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->string('province')->nullable()->after('address');
            $table->string('regency')->nullable()->after('province');
            $table->string('district')->nullable()->after('regency');
            $table->string('village')->nullable()->after('district');
            $table->string('postal_code', 10)->nullable()->after('village');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->dropColumn(['province', 'regency', 'district', 'village', 'postal_code']);
        });
    }
};
