<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add missing fields to erp_mes_work_orders
        Schema::table('erp_mes_work_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('erp_mes_work_orders', 'operator_id')) {
                $table->foreignId('operator_id')->nullable()->constrained('users')->nullOnDelete()->after('machine_id');
            }
            if (!Schema::hasColumn('erp_mes_work_orders', 'product_id')) {
                $table->foreignId('product_id')->nullable()->after('operator_id');
            }
            if (!Schema::hasColumn('erp_mes_work_orders', 'bom_id')) {
                $table->foreignId('bom_id')->nullable()->after('product_id');
            }
            if (!Schema::hasColumn('erp_mes_work_orders', 'quantity_planned')) {
                $table->unsignedInteger('quantity_planned')->default(1)->after('bom_id');
            }
        });

        // 2. Fix foreign key on work_order_operations to point to erp_mes_work_orders
        if (Schema::hasTable('work_order_operations')) {
            Schema::table('work_order_operations', function (Blueprint $table) {
                // We have to drop the old constraint. The constraint name is usually table_column_foreign
                $table->dropForeign(['work_order_id']);
                
                // Add the new constraint pointing to erp_mes_work_orders
                $table->foreign('work_order_id')
                      ->references('id')
                      ->on('erp_mes_work_orders')
                      ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('work_order_operations')) {
            Schema::table('work_order_operations', function (Blueprint $table) {
                $table->dropForeign(['work_order_id']);
                
                $table->foreign('work_order_id')
                      ->references('id')
                      ->on('work_orders')
                      ->cascadeOnDelete();
            });
        }

        Schema::table('erp_mes_work_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('operator_id');
            $table->dropColumn('product_id'); // If not constrained
            $table->dropColumn('bom_id');
            $table->dropColumn('quantity_planned');
        });
    }
};
