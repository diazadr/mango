<?php

namespace App\Console\Commands;

use App\Models\Edge\EdgeSite;
use App\Models\Edge\EdgeProductionLog;
use App\Models\Edge\EdgeAlarmLog;
use App\Models\Machine\Machine;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpMqtt\Client\Facades\MQTT;

class EdgeMqttListener extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'edge:mqtt-listen';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Listen to EMQX Cloud for incoming edge sync data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Connecting to MQTT Cloud broker at " . config('mqtt-client.connections.default.host') . ":" . config('mqtt-client.connections.default.port'));

        try {
            $mqtt = MQTT::connection();
            $this->info("Connected successfully. Subscribing to mango/edge/+/sync/#");

            // Subscribe to production syncs
            $mqtt->subscribe('mango/edge/+/sync/production', function (string $topic, string $message) {
                $this->handleProductionSync($topic, $message);
            }, 1);

            // Subscribe to alarm syncs
            $mqtt->subscribe('mango/edge/+/sync/alarms', function (string $topic, string $message) {
                $this->handleAlarmSync($topic, $message);
            }, 1);

            $mqtt->loop(true);
        } catch (\Exception $e) {
            $this->error("MQTT Listener crashed: " . $e->getMessage());
            Log::error("EdgeMqttListener Exception", ['error' => $e->getMessage()]);
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    private function getSiteIdFromTopic(string $topic): ?string
    {
        $parts = explode('/', $topic);
        if (count($parts) >= 3) {
            return $parts[2];
        }
        return null;
    }

    private function authenticateSite(string $siteId, array $payload): ?EdgeSite
    {
        if (!isset($payload['api_key'])) {
            return null;
        }

        $hash = hash('sha256', $payload['api_key']);
        return EdgeSite::where('site_id', $siteId)->where('api_key_hash', $hash)->first();
    }

    private function handleProductionSync(string $topic, string $message): void
    {
        $siteId = $this->getSiteIdFromTopic($topic);
        $payload = json_decode($message, true);

        if (!$payload || !$siteId) {
            Log::warning("Invalid MQTT payload on topic {$topic}");
            return;
        }

        $site = $this->authenticateSite($siteId, $payload);
        if (!$site) {
            Log::warning("MQTT Edge Sync Authentication Failed for site {$siteId}");
            return;
        }

        if (!isset($payload['records']) || !is_array($payload['records'])) {
            return;
        }

        $recordedAt = isset($payload['timestamp']) ? Carbon::parse($payload['timestamp']) : now();
        $count = 0;

        DB::transaction(function () use ($site, $payload, $recordedAt, &$count) {
            foreach ($payload['records'] as $record) {
                $machine = Machine::query()->where('code', $record['resource_code'] ?? '')->first();
                
                EdgeProductionLog::create([
                    'site_id'            => $site->site_id,
                    'machine_id'         => $machine?->id,
                    'machine_code'       => $record['resource_code'] ?? 'UNKNOWN',
                    'work_order'         => $record['work_order'] ?? null,
                    'part_number'        => $record['part_number'] ?? null,
                    'shift'              => $record['shift'] ?? null,
                    'operator_id'        => $record['operator_id'] ?? null,
                    'good_quantity'      => $record['good_quantity'] ?? 0,
                    'defect_quantity'    => $record['defect_quantity'] ?? 0,
                    'actual_cycle_time'  => $record['actual_cycle_time'] ?? null,
                    'operating_time_min' => $record['operating_time_min'] ?? null,
                    'downtime_min'       => $record['downtime_min'] ?? null,
                    'downtime_category'  => $record['downtime_category'] ?? null,
                    'oee_percentage'     => $record['oee_percentage'] ?? null,
                    'availability'       => $record['availability'] ?? null,
                    'performance'        => $record['performance'] ?? null,
                    'quality'            => $record['quality'] ?? null,
                    'recorded_at'        => $recordedAt,
                ]);
                $count++;
            }
            $site->touchSync();
        });

        $this->info("Processed {$count} production records for site {$siteId}");
    }

    private function handleAlarmSync(string $topic, string $message): void
    {
        $siteId = $this->getSiteIdFromTopic($topic);
        $payload = json_decode($message, true);

        if (!$payload || !$siteId) {
            return;
        }

        $site = $this->authenticateSite($siteId, $payload);
        if (!$site) {
            return;
        }

        if (!isset($payload['records']) || !is_array($payload['records'])) {
            return;
        }

        $count = 0;

        DB::transaction(function () use ($site, $payload, &$count) {
            foreach ($payload['records'] as $record) {
                $machine = Machine::query()->where('code', $record['resource_code'] ?? '')->first();

                EdgeAlarmLog::create([
                    'site_id'       => $site->site_id,
                    'machine_id'    => $machine?->id,
                    'machine_code'  => $record['resource_code'] ?? 'UNKNOWN',
                    'alarm_code'    => $record['alarm_code'] ?? null,
                    'alarm_message' => $record['alarm_message'] ?? 'Unknown Alarm',
                    'severity'      => $record['severity'] ?? 'warning',
                    'occurred_at'   => isset($record['occurred_at']) ? Carbon::parse($record['occurred_at']) : now(),
                    'resolved_at'   => isset($record['resolved_at']) ? Carbon::parse($record['resolved_at']) : null,
                ]);
                $count++;
            }
            $site->touchSync();
        });

        $this->info("Processed {$count} alarm records for site {$siteId}");
    }
}
