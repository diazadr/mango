<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Mes\ProductionRecord;
use App\Models\Umkm\ProductionCapacity;
use App\Models\Umkm\Product;

class SyncProductionCapacity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'erp:sync-capacity {--days=30 : Number of past days to evaluate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync UMKM Production Capacity based on average ERP Production Records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $this->info("Calculating average daily production capacity based on last {$days} days...");

        $thresholdDate = now()->subDays($days);

        // Calculate total good quantity grouped by UMKM and Product over the specified days
        $stats = DB::table('erp_mes_production_records')
            ->join('erp_mes_work_orders', 'erp_mes_production_records.work_order_id', '=', 'erp_mes_work_orders.id')
            ->join('erp_products', 'erp_mes_work_orders.product_id', '=', 'erp_products.id')
            ->whereNotNull('erp_products.umkm_product_id')
            ->where('erp_mes_production_records.recorded_at', '>=', $thresholdDate)
            ->select(
                'erp_mes_production_records.umkm_id',
                'erp_products.umkm_product_id',
                DB::raw('SUM(erp_mes_production_records.good_quantity) as total_good')
            )
            ->groupBy('erp_mes_production_records.umkm_id', 'erp_products.umkm_product_id')
            ->get();

        $updatedCount = 0;

        foreach ($stats as $stat) {
            $averageDaily = $stat->total_good / $days;

            if ($averageDaily <= 0) continue;

            $product = Product::find($stat->umkm_product_id);
            if (!$product) continue;

            // Update or create capacity record
            ProductionCapacity::updateOrCreate(
                [
                    'umkm_id' => $stat->umkm_id,
                    'product_name' => $product->name,
                ],
                [
                    'capacity_per_day' => round($averageDaily, 2),
                    'unit' => $product->unit ?? 'pcs',
                    'notes' => 'Auto-calculated by ERP (Last ' . $days . ' days avg)',
                ]
            );

            $updatedCount++;
        }

        $this->info("Successfully synchronized capacity for {$updatedCount} products.");
    }
}
