<?php

namespace App\Http\Controllers\Api\V1\Integration;

use App\Http\Controllers\Controller;
use App\Models\Mes\AlarmEvent;
use App\Models\Mes\ProductionRecord;
use App\Models\Erp\WorkOrder;
use App\Models\Mes\DowntimeLog;
use App\Models\Edge\EdgeAlarmLog;
use App\Models\Edge\EdgeProductionLog;
use App\Models\Edge\EdgeSite;
use App\Models\Edge\EdgeWorkOrder as EdgeWorkOrderModel;
use App\Models\Machine\Machine;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Umkm\Umkm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class EdgeIntegrationController extends Controller
{
    // ── Helper: get authenticated site from middleware ─────────────────────────
    private function site(Request $request): EdgeSite
    {
        /** @var EdgeSite $site */
        return $request->attributes->get('edge_site', new EdgeSite([
            'site_id' => config('edge.site_id', 'FACTORY_001'),
        ]));
    }

    public function status(Request $request): JsonResponse
    {
        $site = $this->site($request);
        return response()->json([
            'success' => true,
            'data' => [
                'service'             => 'mango-backend',
                'site_id'             => $site->site_id,
                'site_name'           => $site->name ?? 'Default Site',
                'timestamp'           => now()->toIso8601String(),
                'accepting_edge_sync' => true,
            ],
        ]);
    }

    public function storeProductionData(Request $request): JsonResponse
    {
        $site = $this->site($request);

        $validated = $request->validate([
            'site_id' => ['required', 'string', 'max:100'],
            'timestamp' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.resource_code' => ['required', 'string', 'max:100'],
            'records.*.work_order' => ['nullable', 'string', 'max:100'],
            'records.*.part_number' => ['nullable', 'string', 'max:100'],
            'records.*.shift' => ['nullable', 'integer', 'between:1,3'],
            'records.*.operator_id' => ['nullable', 'string', 'max:100'],
            'records.*.good_quantity' => ['nullable', 'integer', 'min:0'],
            'records.*.defect_quantity' => ['nullable', 'integer', 'min:0'],
            'records.*.actual_cycle_time' => ['nullable', 'numeric', 'min:0'],
            'records.*.operating_time_min' => ['nullable', 'numeric', 'min:0'],
            'records.*.downtime_min' => ['nullable', 'numeric', 'min:0'],
            'records.*.downtime_category' => ['nullable', 'string', 'max:100'],
            'records.*.oee_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'records.*.availability' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'records.*.performance' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'records.*.quality' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $recordedAt = Carbon::parse($validated['timestamp']);
        $created = [];

        // Validate that the pushed site_id matches the authenticated site
        if ($validated['site_id'] !== $site->site_id) {
            return response()->json([
                'success' => false,
                'message' => "Site ID mismatch: token belongs to [{$site->site_id}] but payload says [{$validated['site_id']}].",
            ], 422);
        }

        DB::transaction(function () use ($validated, $recordedAt, &$created): void {
            foreach ($validated['records'] as $record) {
                $machine = Machine::query()->where('code', $record['resource_code'])->first();
                $ownerIds = $this->resolveOwnerIds($machine);

                $log = EdgeProductionLog::create([
                    'site_id'            => $validated['site_id'],
                    'machine_id'         => $machine?->id,
                    'machine_code'       => $record['resource_code'],
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
                    'payload'            => $record,
                ]);

                // ── Auto-create DowntimeLog dari edge data ────────────────────
                if (!empty($record['downtime_min']) && $record['downtime_min'] > 0 && $machine) {
                    $downtimeStart = $recordedAt->copy()->subMinutes((int) $record['downtime_min']);
                    $reasonCode = strtoupper($record['downtime_category'] ?? 'OTHER');
                    // Map edge categories ke Six Big Losses
                    $reasonMap = [
                        'BREAKDOWN' => 'BREAKDOWN', 'FAILURE' => 'BREAKDOWN',
                        'SETUP' => 'SETUP', 'CHANGEOVER' => 'SETUP',
                        'MINOR' => 'MINOR_STOP', 'IDLE' => 'MINOR_STOP',
                        'SPEED' => 'REDUCED_SPEED', 'SLOW' => 'REDUCED_SPEED',
                        'DEFECT' => 'PROCESS_DEFECT', 'REWORK' => 'REWORK',
                    ];
                    foreach ($reasonMap as $key => $mapped) {
                        if (str_contains($reasonCode, $key)) { $reasonCode = $mapped; break; }
                    }
                    DowntimeLog::create([
                        'machine_id'    => $machine->id,
                        'work_order_id' => null, // linked after WO creation
                        'source'        => 'edge',
                        'started_at'    => $downtimeStart,
                        'ended_at'      => $recordedAt,
                        'duration_min'  => $record['downtime_min'],
                        'reason_code'   => $reasonCode,
                        'description'   => "Edge auto: {$record['downtime_category']}",
                        'is_planned'    => false,
                    ]);
                }

                $workOrder = null;
                if (! empty($record['work_order'])) {
                    $workOrder = WorkOrder::query()->where('code', $record['work_order'])->first();

                    // [FIX ANTI-PATTERN] Jangan buat WO fiktif dari Edge.
                    // WO harus dibuat oleh Manajer di MES, bukan oleh perangkat Edge.
                    // Jika WO tidak ditemukan, catat log warning dan lanjutkan tanpa WO.
                    if (! $workOrder) {
                        \Illuminate\Support\Facades\Log::warning(
                            "[Edge] Work Order tidak ditemukan: [{$record['work_order']}] dari mesin [{$record['resource_code']}]. " .
                            "Edge tidak berwenang membuat Work Order baru. Harap buat WO melalui dashboard MES."
                        );
                    }
                }

                ProductionRecord::create([
                    'work_order_id'      => $workOrder?->id,
                    'machine_id'         => $machine?->id,
                    'institution_id'     => $ownerIds['institution_id'],
                    'organization_id'    => $ownerIds['organization_id'],
                    'umkm_id'            => $ownerIds['umkm_id'],
                    'shift'              => $record['shift'] ?? null,
                    'good_quantity'      => $record['good_quantity'] ?? 0,
                    'reject_quantity'    => $record['defect_quantity'] ?? 0,
                    'cycle_time_actual'  => $record['actual_cycle_time'] ?? null,
                    'operating_time_min' => $record['operating_time_min'] ?? null,
                    'downtime_min'       => $record['downtime_min'] ?? null,
                    'recorded_at'        => $recordedAt,
                    'source'             => 'edge',
                    'payload'            => $record,
                ]);

                if ($workOrder) {
                    // [FIX IDEMPOTENCY] Gunakan SUM absolut dari semua ProductionRecord
                    // bukan increment() untuk mencegah data ganda akibat network retry.
                    $totals = ProductionRecord::where('work_order_id', $workOrder->id)
                        ->selectRaw('SUM(good_quantity) as total_good, SUM(reject_quantity) as total_reject')
                        ->first();

                    $workOrder->update([
                        'completed_quantity' => (int) ($totals->total_good ?? 0),
                        'reject_quantity'    => (int) ($totals->total_reject ?? 0),
                    ]);

                    if ($workOrder->status === 'released') {
                        $workOrder->update(['status' => 'in_progress']);
                    }

                    $workOrder->refresh();
                    EdgeWorkOrderModel::syncFromErpWorkOrder($workOrder);
                }

                $created[] = $log;
            }
        });

        // Update last_sync_at on the site (only if it's a real DB record)
        if ($site->id) {
            $site->touchSync();
        }

        return response()->json([
            'success' => true,
            'message' => 'Production data received.',
            'data' => [
                'accepted_records' => count($created),
                'site_id'          => $site->site_id,
            ],
        ], 201);
    }

    public function storeAlarm(Request $request): JsonResponse
    {
        $site = $this->site($request);

        $validated = $request->validate([
            'site_id'       => ['required', 'string', 'max:100'],
            'resource_code' => ['required', 'string', 'max:100'],
            'alarm_code'    => ['required'],
            'message'       => ['required', 'string'],
            'severity'      => ['required', 'string', 'max:50'],
            'occurred_at'   => ['required', 'date'],
            'resolved_at'   => ['nullable', 'date'],
        ]);

        if ($validated['site_id'] !== $site->site_id) {
            return response()->json([
                'success' => false,
                'message' => "Site ID mismatch: [{$validated['site_id']}] vs authenticated [{$site->site_id}].",
            ], 422);
        }

        $machine = Machine::query()->where('code', $validated['resource_code'])->first();
        $ownerIds = $this->resolveOwnerIds($machine);

        $alarm = EdgeAlarmLog::create([
            'site_id' => $validated['site_id'],
            'machine_id' => $machine?->id,
            'machine_code' => $validated['resource_code'],
            'alarm_code' => (string) $validated['alarm_code'],
            'message' => $validated['message'],
            'severity' => $validated['severity'],
            'occurred_at' => Carbon::parse($validated['occurred_at']),
            'resolved_at' => isset($validated['resolved_at']) ? Carbon::parse($validated['resolved_at']) : null,
            'payload' => $validated,
        ]);

        AlarmEvent::create([
            'machine_id' => $machine?->id,
            'institution_id' => $ownerIds['institution_id'],
            'organization_id' => $ownerIds['organization_id'],
            'umkm_id' => $ownerIds['umkm_id'],
            'code' => (string) $validated['alarm_code'],
            'message' => $validated['message'],
            'severity' => $validated['severity'],
            'status' => isset($validated['resolved_at']) ? 'resolved' : 'open',
            'occurred_at' => Carbon::parse($validated['occurred_at']),
            'resolved_at' => isset($validated['resolved_at']) ? Carbon::parse($validated['resolved_at']) : null,
            'payload' => $validated,
        ]);

        if ($site->id) {
            $site->touchSync();
        }

        return response()->json([
            'success' => true,
            'message' => 'Alarm event received.',
            'data'    => ['id' => $alarm->id, 'site_id' => $site->site_id],
        ], 201);
    }

    public function workOrders(Request $request): JsonResponse
    {
        $machineCode = $request->query('machine_code');

        $query = WorkOrder::query()
            ->with(['machine', 'institution', 'organization', 'umkm'])
            ->whereIn('status', ['draft', 'released', 'in_progress'])
            ->orderBy('planned_start_at');

        if ($machineCode) {
            $query->whereHas('machine', function ($q) use ($machineCode): void {
                $q->where('code', $machineCode);
            });
        }

        $orders = $query->get()->map(function (WorkOrder $order) {
            return [
                'work_order' => $order->code,
                'resource_code' => $order->machine?->code,
                'part_number' => $order->part_number,
                'planned_quantity' => $order->target_quantity,
                'produced_quantity' => $order->completed_quantity,
                'shift' => $order->shift,
                'status' => $order->status,
                'planned_start_at' => optional($order->planned_start_at)?->toIso8601String(),
                'planned_end_at' => optional($order->planned_end_at)?->toIso8601String(),
                'owner' => [
                    'institution' => $order->institution?->only(['id', 'name', 'slug']),
                    'organization' => $order->organization?->only(['id', 'name', 'slug']),
                    'umkm' => $order->umkm?->only(['id', 'name', 'slug', 'uuid']),
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function masterData(): JsonResponse
    {
        $machines = Machine::query()
            ->with('owner')
            ->where('is_iot_enabled', true)
            ->orderBy('name')
            ->get()
            ->map(function (Machine $machine) {
                return [
                    'id' => $machine->id,
                    'resource_code' => $machine->code,
                    'name' => $machine->name,
                    'type' => $machine->type,
                    'brand' => $machine->brand,
                    'location' => $machine->location,
                    'status' => $machine->status,
                    'owner_type' => class_basename($machine->owner_type),
                    'owner_id' => $machine->owner_id,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'site_id' => config('edge.site_id'),
                'machines' => $machines,
                'institutions' => Institution::query()->where('is_active', true)->get(['id', 'name', 'slug']),
                'organizations' => Organization::query()->where('is_active', true)->get(['id', 'name', 'slug']),
                'umkms' => Umkm::query()->where('is_active', true)->get(['id', 'uuid', 'name', 'slug', 'institution_id', 'organization_id']),
            ],
        ]);
    }

    private function resolveOwnerIds(?Machine $machine): array
    {
        $institutionId = null;
        $organizationId = null;
        $umkmId = null;

        if (! $machine) {
            return [
                'institution_id' => null,
                'organization_id' => null,
                'umkm_id' => null,
            ];
        }

        if ($machine->owner_type === Umkm::class) {
            $umkmId = $machine->owner_id;
            $umkm = Umkm::find($umkmId);
            $institutionId = $umkm?->institution_id;
            $organizationId = $umkm?->organization_id;
        } elseif ($machine->owner_type === Institution::class) {
            $institutionId = $machine->owner_id;
        } elseif ($machine->owner_type === Organization::class) {
            $organizationId = $machine->owner_id;
        }

        return [
            'institution_id' => $institutionId,
            'organization_id' => $organizationId,
            'umkm_id' => $umkmId,
        ];
    }
}
