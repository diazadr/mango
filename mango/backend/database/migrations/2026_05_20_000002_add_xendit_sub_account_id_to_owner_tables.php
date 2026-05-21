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
        Schema::table('umkms', function (Blueprint $table) {
            $table->string('xendit_sub_account_id')->nullable()->after('email');
        });

        Schema::table('organizations', function (Blueprint $table) {
            $table->string('xendit_sub_account_id')->nullable()->after('email');
        });

        Schema::table('institutions', function (Blueprint $table) {
            $table->string('xendit_sub_account_id')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkms', function (Blueprint $table) {
            $table->dropColumn('xendit_sub_account_id');
        });

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('xendit_sub_account_id');
        });

        Schema::table('institutions', function (Blueprint $table) {
            $table->dropColumn('xendit_sub_account_id');
        });
    }
};
