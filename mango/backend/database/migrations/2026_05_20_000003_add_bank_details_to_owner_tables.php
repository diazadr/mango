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
            $table->string('bank_code')->nullable()->after('xendit_sub_account_id');
            $table->string('bank_account_name')->nullable()->after('bank_code');
            $table->string('bank_account_number')->nullable()->after('bank_account_name');
        });

        Schema::table('organizations', function (Blueprint $table) {
            $table->string('bank_code')->nullable()->after('xendit_sub_account_id');
            $table->string('bank_account_name')->nullable()->after('bank_code');
            $table->string('bank_account_number')->nullable()->after('bank_account_name');
        });

        Schema::table('institutions', function (Blueprint $table) {
            $table->string('bank_code')->nullable()->after('xendit_sub_account_id');
            $table->string('bank_account_name')->nullable()->after('bank_code');
            $table->string('bank_account_number')->nullable()->after('bank_account_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('umkms', function (Blueprint $table) {
            $table->dropColumn(['bank_code', 'bank_account_name', 'bank_account_number']);
        });

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['bank_code', 'bank_account_name', 'bank_account_number']);
        });

        Schema::table('institutions', function (Blueprint $table) {
            $table->dropColumn(['bank_code', 'bank_account_name', 'bank_account_number']);
        });
    }
};
