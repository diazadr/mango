<?php

namespace Database\Seeders;

use App\Models\Edge\EdgeSite;
use App\Models\Erp\WorkOrder;
use App\Models\Machine\Machine;
use App\Models\Umkm\Umkm;
use Illuminate\Database\Seeder;

/**
 * EdgeManufacturingSeeder
 * 
 * Seeds the MANGO platform with the minimum configuration required
 * for real-time integration with the Edge Manufacturing System (Go).
 * 
 * What it does:
 * 1. Registers the Edge Site (API key auth so Go can call MANGO API)
 * 2. Creates IoT-enabled machines that map to Edge machine_configs
 * 3. Creates Work Orders that Edge can pull via /work-orders endpoint
 * 
 * Run: php artisan db:seed --class=EdgeManufacturingSeeder
 */
class EdgeManufacturingSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedEdgeSite();
        $this->seedMachines();
        $this->seedWorkOrders();
    }

    /**
     * Register the Edge site so Go's API key (edge_4ZzOdnFc91cfuny8mP0YlB1PAYwoRRoamET99yWw)
     * is recognized by the EnsureEdgeApiKey middleware.
     */
    private function seedEdgeSite(): void
    {
        $apiKey = config('edge.api_key', 'edge_4ZzOdnFc91cfuny8mP0YlB1PAYwoRRoamET99yWw');
        $siteId = 'POLMAN_BANDUNG_EDGE';

        EdgeSite::updateOrCreate(
            ['site_id' => $siteId],
            [
                'name'            => 'Pusat Inovasi Polman — EDGE-01',
                'api_key_hash'    => hash('sha256', $apiKey),
                'api_key_preview' => substr($apiKey, 0, 8) . '****',
                'description'     => 'Edge gateway utama Kampus Polman Bandung untuk monitoring mesin praktik.',
                'location'        => 'Gedung Direktorat / Workshop',
                'is_active'       => true,
                'machine_count'   => 2,
            ]
        );

        $this->command->info("Edge Site [{$siteId}] registered.");
    }

    /**
     * Create machines in MANGO that correspond to Edge machine_configs.
     * The `code` field maps to Edge's `machine_id`.
     */
    private function seedMachines(): void
    {
        // Owner for machines is the Institution (Polman Bandung)
        $institution = \App\Models\Master\Institution::where('name', 'LIKE', '%Polman%')->first() 
                      ?? \App\Models\Master\Institution::first();
        
        $ownerType = \App\Models\Master\Institution::class;
        $ownerId   = $institution?->id ?? 1;

        $machines = [
            [
                'code'     => 'dmg_mori_ntx1000',
                'name'     => 'CNC DMG Mori NTX 1000',
                'type'     => 'CNC Turning',
                'brand'    => 'DMG Mori',
                'location' => 'Main Workshop - Bay 1',
            ],
            [
                'code'     => 'makino_01',
                'name'     => 'CNC Makino',
                'type'     => 'CNC Milling',
                'brand'    => 'Makino',
                'location' => 'Main Workshop - Bay 2',
            ],
        ];

        foreach ($machines as $data) {
            Machine::updateOrCreate(
                ['code' => $data['code']],
                [
                    'name'           => $data['name'],
                    'slug'           => \Illuminate\Support\Str::slug($data['name']),
                    'type'           => $data['type'],
                    'brand'          => $data['brand'],
                    'location'       => $data['location'],
                    'status'         => 'active',
                    'is_iot_enabled' => true,
                    'owner_type'     => $ownerType,
                    'owner_id'       => $ownerId,
                    'is_reservable'  => true,
                    'hourly_rate'    => 250000,
                ]
            );
        }

        $this->command->info(count($machines) . ' IoT machines registered for Institution.');
    }

    /**
     * Create active Work Orders that Edge can pull via GET /work-orders.
     */
    private function seedWorkOrders(): void
    {
        $machines = Machine::whereIn('code', ['dmg_mori_ntx1000', 'makino_01'])->get()->keyBy('code');

        $orders = [
            [
                'code'            => 'WO-POLMAN-2026-001',
                'title'           => 'Job Praktik Shaft A',
                'part_number'     => 'P-SHAFT-A',
                'machine_code'    => 'dmg_mori_ntx1000',
                'target_quantity' => 50,
                'shift'           => 1,
                'status'          => 'released',
            ],
            [
                'code'            => 'WO-POLMAN-2026-002',
                'title'           => 'Job Praktik Gear B',
                'part_number'     => 'P-GEAR-B',
                'machine_code'    => 'makino_01',
                'target_quantity' => 30,
                'shift'           => 1,
                'status'          => 'released',
            ],
        ];

        foreach ($orders as $data) {
            $machine = $machines->get($data['machine_code']);

            WorkOrder::updateOrCreate(
                ['code' => $data['code']],
                [
                    'title'              => $data['title'],
                    'part_number'        => $data['part_number'],
                    'machine_id'         => $machine?->id,
                    'institution_id'     => $machine?->owner_id, // Owned by institution
                    'target_quantity'     => $data['target_quantity'],
                    'completed_quantity'  => 0,
                    'reject_quantity'     => 0,
                    'shift'              => $data['shift'],
                    'status'             => $data['status'],
                    'source'             => 'manual',
                    'planned_start_at'   => now(),
                    'planned_end_at'     => now()->addDays(30),
                ]
            );
        }

        $this->command->info(count($orders) . ' Work Orders created for Polman Edge.');
    }
}
