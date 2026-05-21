<?php

namespace App\Http\Controllers\Api\V1\ErpMes;

use App\Http\Controllers\Controller;
use App\Http\Resources\ErpMes\AlarmEventResource;
use App\Http\Resources\ErpMes\EdgeAlarmLogResource;
use App\Http\Resources\ErpMes\EdgeProductionLogResource;
use App\Http\Resources\ErpMes\ProductionRecordResource;
use App\Http\Resources\ErpMes\WorkOrderResource;
use App\Models\Edge\EdgeAlarmLog;
use App\Models\Edge\EdgeProductionLog;
use App\Models\Edge\EdgeWorkOrder as EdgeWorkOrderMirror;
use App\Models\Machine\Machine;
use App\Models\Mes\AlarmEvent;
use App\Models\Mes\ProductionRecord;
use App\Models\Erp\WorkOrder;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Umkm\Inventory;
use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ManufacturingController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $workOrders = $this->scopeByUser(WorkOrder::query(), $request->user());
        $production = $this->scopeByUser(ProductionRecord::query(), $request->user());
        $alarms = $this->scopeByUser(AlarmEvent::query(), $request->user());
        $edgeProduction = $this->scopeEdgeLogsByMachine(EdgeProductionLog::query(), $request->user());
        $edgeAlarms = $this->scopeEdgeLogsByMachine(EdgeAlarmLog::query(), $request->user());

        return $this->ok([
            'work_orders' => [
                'total' => (clone $workOrders)->count(),
                'draft' => (clone $workOrders)->where('status', 'draft')->count(),
                'released' => (clone $workOrders)->where('status', 'released')->count(),
                'in_progress' => (clone $workOrders)->where('status', 'in_progress')->count(),
                'completed' => (clone $workOrders)->where('status', 'completed')->count(),
            ],
            'production' => [
                'records' => (clone $production)->count(),
                'good_quantity' => (int) (clone $production)->sum('good_quantity'),
                'reject_quantity' => (int) (clone $production)->sum('reject_quantity'),
            ],
            'alarms' => [
                'open' => (clone $alarms)->where('status', 'open')->count(),
                'resolved' => (clone $alarms)->where('status', 'resolved')->count(),
                'critical_open' => (clone $alarms)->where('status', 'open')->where('severity', 'critical')->count(),
            ],
            'edge' => [
                'site_id' => config('edge.site_id'),
                'production_logs' => (clone $edgeProduction)->count(),
                'alarm_logs' => (clone $edgeAlarms)->count(),
            ],
        ]);
    }

    public function listWorkOrders(Request $request): JsonResponse
    {
        $query = $this->scopeByUser(
            WorkOrder::query()->with(['machine', 'institution', 'organization', 'umkm']),
            $request->user()
        );

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($machineId = $request->get('machine_id')) {
            $query->where('machine_id', $machineId);
        }
        if ($search = $request->get('search')) {
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%");
            });
        }

        $query->orderByDesc('planned_start_at')->orderByDesc('created_at');

        return $this->resource(WorkOrderResource::collection($query->paginate(min((int) $request->get('per_page', 15), 100))));
    }

    public function storeWorkOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100', 'unique:erp_mes_work_orders,code'],
            'machine_id' => ['nullable', 'exists:machines,id'],
            'institution_id' => ['nullable', 'exists:institutions,id'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'umkm_id' => ['nullable', 'exists:umkms,id'],
            'title' => ['required', 'string', 'max:255'],
            'part_number' => ['nullable', 'string', 'max:100'],
            'target_quantity' => ['required', 'integer', 'min:0'],
            'completed_quantity' => ['nullable', 'integer', 'min:0'],
            'reject_quantity' => ['nullable', 'integer', 'min:0'],
            'priority' => ['nullable', 'in:low,normal,high,urgent'],
            'status' => ['nullable', 'in:draft,released,in_progress,completed,cancelled'],
            'shift' => ['nullable', 'integer', 'between:1,3'],
            'source' => ['nullable', 'in:manual,edge'],
            'notes' => ['nullable', 'string'],
            'planned_start_at' => ['nullable', 'date'],
            'planned_end_at' => ['nullable', 'date'],
            'actual_start_at' => ['nullable', 'date'],
            'actual_end_at' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $ownership = $this->resolveOwnershipContext($user);

        if (! empty($validated['machine_id'])) {
            $machine = Machine::find($validated['machine_id']);
            abort_unless($machine && $this->canAccessMachine($machine, $user), 403);
        }

        $workOrder = WorkOrder::create([
            ...$validated,
            'completed_quantity' => $validated['completed_quantity'] ?? 0,
            'reject_quantity' => $validated['reject_quantity'] ?? 0,
            'priority' => $validated['priority'] ?? 'normal',
            'status' => $validated['status'] ?? 'draft',
            'source' => $validated['source'] ?? 'manual',
            'umkm_id' => $ownership['umkm_id'],
            'institution_id' => $ownership['institution_id'],
            'organization_id' => $ownership['organization_id'],
        ]);

        $workOrder->load(['machine', 'institution', 'organization', 'umkm']);
        EdgeWorkOrderMirror::syncFromErpWorkOrder($workOrder);

        return $this->resource(new WorkOrderResource($workOrder), 'Work order berhasil dibuat.', 201);
    }

    public function showWorkOrder(Request $request, WorkOrder $workOrder): JsonResponse
    {
        abort_unless($this->canAccess($workOrder, $request->user()), 403);

        return $this->resource(new WorkOrderResource($workOrder->load(['machine', 'institution', 'organization', 'umkm', 'productionRecords', 'alarmEvents'])));
    }

    public function updateWorkOrder(Request $request, WorkOrder $workOrder): JsonResponse
    {
        abort_unless($this->canAccess($workOrder, $request->user()), 403);

        $validated = $request->validate([
            'machine_id' => ['nullable', 'exists:machines,id'],
            'institution_id' => ['nullable', 'exists:institutions,id'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'umkm_id' => ['nullable', 'exists:umkms,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'part_number' => ['nullable', 'string', 'max:100'],
            'target_quantity' => ['sometimes', 'integer', 'min:0'],
            'completed_quantity' => ['nullable', 'integer', 'min:0'],
            'reject_quantity' => ['nullable', 'integer', 'min:0'],
            'priority' => ['nullable', 'in:low,normal,high,urgent'],
            'status' => ['nullable', 'in:draft,released,in_progress,completed,cancelled'],
            'shift' => ['nullable', 'integer', 'between:1,3'],
            'notes' => ['nullable', 'string'],
            'planned_start_at' => ['nullable', 'date'],
            'planned_end_at' => ['nullable', 'date'],
            'actual_start_at' => ['nullable', 'date'],
            'actual_end_at' => ['nullable', 'date'],
        ]);

        unset($validated['institution_id'], $validated['organization_id'], $validated['umkm_id']);

        if (! empty($validated['machine_id'])) {
            $machine = Machine::find($validated['machine_id']);
            abort_unless($machine && $this->canAccessMachine($machine, $request->user()), 403);
        }

        $workOrder->update($validated);

        $fresh = $workOrder->fresh()->load(['machine', 'institution', 'organization', 'umkm']);
        EdgeWorkOrderMirror::syncFromErpWorkOrder($fresh);

        return $this->resource(new WorkOrderResource($fresh), 'Work order berhasil diperbarui.');
    }

    public function listProductionRecords(Request $request): JsonResponse
    {
        $query = $this->scopeByUser(
            ProductionRecord::query()->with(['workOrder', 'machine', 'institution', 'organization', 'umkm', 'operator']),
            $request->user()
        );

        if ($workOrderId = $request->get('work_order_id')) {
            $query->where('work_order_id', $workOrderId);
        }
        if ($machineId = $request->get('machine_id')) {
            $query->where('machine_id', $machineId);
        }
        if ($date = $request->get('date')) {
            $query->whereDate('recorded_at', Carbon::parse($date));
        }

        $query->orderByDesc('recorded_at');

        return $this->resource(ProductionRecordResource::collection($query->paginate(min((int) $request->get('per_page', 15), 100))));
    }

    public function storeProductionRecord(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'work_order_id' => ['nullable', 'exists:erp_mes_work_orders,id'],
            'machine_id' => ['nullable', 'exists:machines,id'],
            'institution_id' => ['nullable', 'exists:institutions,id'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'umkm_id' => ['nullable', 'exists:umkms,id'],
            'operator_user_id' => ['nullable', 'exists:users,id'],
            'shift' => ['nullable', 'integer', 'between:1,3'],
            'good_quantity' => ['required', 'integer', 'min:0'],
            'reject_quantity' => ['nullable', 'integer', 'min:0'],
            'reject_reason' => ['nullable', 'string', 'max:255', 'required_with:reject_quantity'],
            'cycle_time_actual' => ['nullable', 'numeric', 'min:0'],
            'operating_time_min' => ['nullable', 'numeric', 'min:0'],
            'downtime_min' => ['nullable', 'numeric', 'min:0'],
            'recorded_at' => ['nullable', 'date'],
            'source' => ['nullable', 'in:manual,edge'],
        ]);

        $user = $request->user();
        $ownership = $this->resolveOwnershipContext($user);

        if (! empty($validated['machine_id'])) {
            $machine = Machine::find($validated['machine_id']);
            abort_unless($machine && $this->canAccessMachine($machine, $user), 403);
        }

        $workOrder = null;
        if (!empty($validated['work_order_id'])) {
            $workOrder = WorkOrder::find($validated['work_order_id']);
            if ($workOrder) {
                abort_unless($this->canAccess($workOrder, $user), 403);

                if ($workOrder->completed_quantity + ($validated['good_quantity'] ?? 0) > $workOrder->target_quantity) {
                    return response()->json([
                        'message' => 'Over-production terdeteksi. Jumlah yang dimasukkan melebihi sisa target Work Order.',
                    ], 422);
                }

                $erpProduct = $workOrder->product;
                if ($erpProduct) {
                    $activeBom = $erpProduct->bomHeaders()->where('is_active', true)->first();
                    if ($activeBom) {
                        $ownerType = $workOrder->umkm_id ? 'App\\Models\\Umkm\\Umkm' : ($workOrder->organization_id ? 'App\\Models\\Master\\Organization' : null);
                        $ownerId = $workOrder->umkm_id ?? $workOrder->organization_id;
                        
                        if ($ownerType && $ownerId) {
                            foreach ($activeBom->lines as $line) {
                                $deduction = $line->quantity * ($validated['good_quantity'] ?? 0);
                                $material = \App\Models\Erp\ErpMaterial::where([
                                    'owner_type' => $ownerType,
                                    'owner_id' => $ownerId,
                                    'name' => $line->material_name,
                                ])->first();

                                $currentStock = $material ? $material->stock_qty : 0;
                                if ($currentStock < $deduction) {
                                    return response()->json([
                                        'message' => "Stok bahan baku tidak mencukupi: {$line->material_name}. (Dibutuhkan: {$deduction}, Tersedia: {$currentStock})",
                                    ], 422);
                                }
                            }
                        }
                    }
                }
            }
        }

        $record = ProductionRecord::create([
            ...$validated,
            'machine_id' => $workOrder?->machine_id ?? ($validated['machine_id'] ?? null),
            'umkm_id' => $workOrder?->umkm_id ?? $ownership['umkm_id'],
            'institution_id' => $workOrder?->institution_id ?? $ownership['institution_id'],
            'organization_id' => $workOrder?->organization_id ?? $ownership['organization_id'],
            'reject_quantity' => $validated['reject_quantity'] ?? 0,
            'recorded_at' => isset($validated['recorded_at']) ? Carbon::parse($validated['recorded_at']) : now(),
            'source' => $validated['source'] ?? 'manual',
        ]);

        if ($workOrder) {
                $workOrder->increment('completed_quantity', $record->good_quantity);
                $workOrder->increment('reject_quantity', $record->reject_quantity);
                
                $workOrder->refresh();
                
                // Auto-Complete Logic
                if ($workOrder->completed_quantity >= $workOrder->target_quantity) {
                    $workOrder->update(['status' => 'completed']);
                } elseif ($workOrder->status === 'released') {
                    $workOrder->update(['status' => 'in_progress']);
                }

                // Auto-Backflushing (Deduct Raw Materials)
                $erpProduct = $workOrder->product;
                if ($erpProduct) {
                    $activeBom = $erpProduct->bomHeaders()->where('is_active', true)->first();
                    if ($activeBom) {
                        $ownerType = $workOrder->umkm_id ? 'App\\Models\\Umkm\\Umkm' : ($workOrder->organization_id ? 'App\\Models\\Master\\Organization' : null);
                        $ownerId = $workOrder->umkm_id ?? $workOrder->organization_id;
                        
                        if ($ownerType && $ownerId) {
                            foreach ($activeBom->lines as $line) {
                                $material = \App\Models\Erp\ErpMaterial::firstOrCreate(
                                    [
                                        'owner_type' => $ownerType,
                                        'owner_id' => $ownerId,
                                        'name' => $line->material_name,
                                    ],
                                    [
                                        'sku' => $line->material_sku,
                                        'unit' => $line->unit ?? 'pcs',
                                        'stock_qty' => 0,
                                    ]
                                );
                                $deduction = $line->quantity * $record->good_quantity;
                                $qtyBefore = $material->stock_qty;
                                $material->decrement('stock_qty', $deduction);
                                
                                \App\Models\Erp\ErpMaterialMovement::create([
                                    'material_id'   => $material->id,
                                    'work_order_id' => $workOrder->id,
                                    'type'          => 'out',
                                    'quantity'      => $deduction,
                                    'qty_before'    => $qtyBefore,
                                    'qty_after'     => $qtyBefore - $deduction,
                                    'reference'     => $workOrder->code,
                                    'notes'         => 'Auto-backflush from Production Record #' . $record->id,
                                    'created_by'    => $record->operator_user_id ?? $request->user()?->id,
                                ]);
                            }
                        }
                    }
                }

                // Inventory Sync Logic
                if ($erpProduct && $erpProduct->umkm_product_id) {
                    $inventory = Inventory::firstOrCreate(
                        [
                            'umkm_id' => $workOrder->umkm_id,
                            'item_type' => 'product',
                            'item_id' => $erpProduct->umkm_product_id,
                        ],
                        [
                            'qty_on_hand' => 0,
                            'qty_reserved' => 0,
                            'updated_at' => now()
                        ]
                    );
                    $inventory->increment('qty_on_hand', $record->good_quantity);
                }
            }

        return $this->resource(new ProductionRecordResource($record->load(['workOrder', 'machine', 'institution', 'organization', 'umkm', 'operator'])), 'Production record berhasil dibuat.', 201);
    }

    /** DELETE /v1/erp-mes/production-records/{record} - Undo feature */
    public function destroyProductionRecord(Request $request, ProductionRecord $record): JsonResponse
    {
        abort_unless($this->canAccess($record, $request->user()), 403);

        $workOrder = $record->work_order_id ? WorkOrder::find($record->work_order_id) : null;
        $erpProduct = $workOrder ? $workOrder->product : null;

        if ($workOrder && $erpProduct && $erpProduct->umkm_product_id) {
            $inventory = Inventory::where([
                'umkm_id' => $workOrder->umkm_id,
                'item_type' => 'product',
                'item_id' => $erpProduct->umkm_product_id,
            ])->first();

            if ($inventory && $inventory->qty_on_hand < $record->good_quantity) {
                return response()->json([
                    'message' => 'Tidak dapat membatalkan: Produk jadi sudah terpakai/terjual di etalase katalog sehingga stok akan menjadi minus.',
                ], 422);
            }
        }

        try {
            DB::beginTransaction();

            if ($workOrder) {
                // Revert Work Order Quantities
                $workOrder->decrement('completed_quantity', $record->good_quantity);
                $workOrder->decrement('reject_quantity', $record->reject_quantity);
                
                $workOrder->refresh();
                
                // Revert Status if it dropped below target
                if ($workOrder->status === 'completed' && $workOrder->completed_quantity < $workOrder->target_quantity) {
                    $workOrder->update(['status' => 'in_progress']);
                }

                // Revert Auto-Backflushing
                if ($erpProduct) {
                    $activeBom = $erpProduct->bomHeaders()->where('is_active', true)->first();
                    if ($activeBom) {
                        $ownerType = $workOrder->umkm_id ? 'App\\Models\\Umkm\\Umkm' : ($workOrder->organization_id ? 'App\\Models\\Master\\Organization' : null);
                        $ownerId = $workOrder->umkm_id ?? $workOrder->organization_id;
                        
                        if ($ownerType && $ownerId) {
                            foreach ($activeBom->lines as $line) {
                                $material = \App\Models\Erp\ErpMaterial::where([
                                    'owner_type' => $ownerType,
                                    'owner_id' => $ownerId,
                                    'name' => $line->material_name,
                                ])->first();

                                if ($material) {
                                    $deduction = $line->quantity * $record->good_quantity;
                                    $qtyBefore = $material->stock_qty;
                                    $material->increment('stock_qty', $deduction);

                                    // Create Rollback Movement
                                    \App\Models\Erp\ErpMaterialMovement::create([
                                        'material_id'   => $material->id,
                                        'work_order_id' => $workOrder->id,
                                        'type'          => 'adjustment',
                                        'quantity'      => $deduction,
                                        'qty_before'    => $qtyBefore,
                                        'qty_after'     => $qtyBefore + $deduction,
                                        'reference'     => $workOrder->code,
                                        'notes'         => 'UNDO: Rolled back from Production Record #' . $record->id,
                                        'created_by'    => $request->user()?->id,
                                    ]);

                                    // Also delete the original 'out' movement to keep ledger clean? 
                                    // Actually, adding an 'adjustment' is standard accounting practice, so we don't delete history.
                                }
                            }
                        }
                    }

                    // Revert Inventory Sync Logic (UMKM Catalog)
                    if ($erpProduct->umkm_product_id) {
                        $inventory = Inventory::where([
                            'umkm_id' => $workOrder->umkm_id,
                            'item_type' => 'product',
                            'item_id' => $erpProduct->umkm_product_id,
                        ])->first();

                        if ($inventory) {
                            $inventory->decrement('qty_on_hand', $record->good_quantity);
                        }
                    }
                }
            }

            // Finally, delete the record itself
            $record->delete();

            DB::commit();
            return response()->json(['message' => 'Production record berhasil dibatalkan dan direkam ulang.']);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membatalkan record: ' . $e->getMessage()], 500);
        }
    }

    public function listAlarmEvents(Request $request): JsonResponse
    {
        $query = $this->scopeByUser(
            AlarmEvent::query()->with(['workOrder', 'machine', 'institution', 'organization', 'umkm']),
            $request->user()
        );

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($severity = $request->get('severity')) {
            $query->where('severity', $severity);
        }
        if ($machineId = $request->get('machine_id')) {
            $query->where('machine_id', $machineId);
        }

        $query->orderByDesc('occurred_at');

        return $this->resource(AlarmEventResource::collection($query->paginate(min((int) $request->get('per_page', 15), 100))));
    }

    public function resolveAlarm(Request $request, AlarmEvent $alarm): JsonResponse
    {
        abort_unless($this->canAccess($alarm, $request->user()), 403);

        $alarm->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        return $this->resource(new AlarmEventResource($alarm->fresh()->load(['workOrder', 'machine', 'institution', 'organization', 'umkm'])), 'Alarm berhasil diselesaikan.');
    }

    public function listEdgeProductionLogs(Request $request): JsonResponse
    {
        $query = $this->scopeEdgeLogsByMachine(
            EdgeProductionLog::query()->with(['machine']),
            $request->user()
        );

        if ($machineId = $request->get('machine_id')) {
            $query->where('machine_id', $machineId);
        }
        if ($date = $request->get('date')) {
            $query->whereDate('recorded_at', Carbon::parse($date));
        }

        $query->orderByDesc('recorded_at');

        return $this->resource(EdgeProductionLogResource::collection($query->paginate(min((int) $request->get('per_page', 15), 100))));
    }

    public function listEdgeAlarmLogs(Request $request): JsonResponse
    {
        $query = $this->scopeEdgeLogsByMachine(
            EdgeAlarmLog::query()->with(['machine']),
            $request->user()
        );

        if ($machineId = $request->get('machine_id')) {
            $query->where('machine_id', $machineId);
        }
        if ($severity = $request->get('severity')) {
            $query->where('severity', $severity);
        }

        $query->orderByDesc('occurred_at');

        return $this->resource(EdgeAlarmLogResource::collection($query->paginate(min((int) $request->get('per_page', 15), 100))));
    }

    /**
     * Edge logs are tied to machines; scope by machine owner (UMKM / institution / organization).
     */
    private function scopeEdgeLogsByMachine(Builder $query, User $user): Builder
    {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        if ($user->umkm) {
            return $query->whereNotNull('machine_id')->whereHas('machine', function (Builder $m) use ($user): void {
                $m->where('owner_type', Umkm::class)->where('owner_id', $user->umkm->id);
            });
        }

        $institutionIds = $user->institutions()->pluck('institutions.id')->filter()->values();
        $organizationIds = $user->organizations()->pluck('organizations.id')->filter()->values();

        if ($institutionIds->isEmpty() && $organizationIds->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereNotNull('machine_id')->whereHas('machine', function (Builder $m) use ($institutionIds, $organizationIds): void {
            $m->where(function (Builder $inner) use ($institutionIds, $organizationIds): void {
                if ($institutionIds->isNotEmpty()) {
                    $inner->orWhere(function (Builder $i) use ($institutionIds): void {
                        $i->where('owner_type', Institution::class)->whereIn('owner_id', $institutionIds);
                    });
                }
                if ($organizationIds->isNotEmpty()) {
                    $inner->orWhere(function (Builder $o) use ($organizationIds): void {
                        $o->where('owner_type', Organization::class)->whereIn('owner_id', $organizationIds);
                    });
                }
            });
        });
    }

    private function scopeByUser(Builder $query, User $user): Builder
    {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        if ($user->umkm) {
            return $query->where('umkm_id', $user->umkm->id);
        }

        $institutionIds = $user->institutions()->pluck('institutions.id')->filter()->values();
        $organizationIds = $user->organizations()->pluck('organizations.id')->filter()->values();

        if ($institutionIds->isEmpty() && $organizationIds->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where(function (Builder $builder) use ($institutionIds, $organizationIds): void {
            if ($institutionIds->isNotEmpty()) {
                $builder->orWhereIn('institution_id', $institutionIds);
            }
            if ($organizationIds->isNotEmpty()) {
                $builder->orWhereIn('organization_id', $organizationIds);
            }
        });
    }

    private function canAccess(object $model, User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->umkm && isset($model->umkm_id) && (int) $model->umkm_id === (int) $user->umkm->id) {
            return true;
        }

        $institutionIds = $user->institutions()->pluck('institutions.id')->map(fn ($id) => (int) $id)->all();
        $organizationIds = $user->organizations()->pluck('organizations.id')->map(fn ($id) => (int) $id)->all();

        return (isset($model->institution_id) && in_array((int) $model->institution_id, $institutionIds, true))
            || (isset($model->organization_id) && in_array((int) $model->organization_id, $organizationIds, true));
    }

    // ── OEE ──────────────────────────────────────────────────────────────────

    private function canAccessMachine(Machine $machine, User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->umkm) {
            return $machine->owner_type === Umkm::class
                && (int) $machine->owner_id === (int) $user->umkm->id;
        }

        $institutionIds = $user->institutions()->pluck('institutions.id')->map(fn ($id) => (int) $id)->all();
        $organizationIds = $user->organizations()->pluck('organizations.id')->map(fn ($id) => (int) $id)->all();

        return ($machine->owner_type === Institution::class && in_array((int) $machine->owner_id, $institutionIds, true))
            || ($machine->owner_type === Organization::class && in_array((int) $machine->owner_id, $organizationIds, true));
    }

    private function resolveOwnershipContext(User $user): array
    {
        return [
            'umkm_id' => $user->umkm?->id,
            'institution_id' => $user->institutions()->first()?->id,
            'organization_id' => $user->organizations()->first()?->id,
        ];
    }

    /** GET /v1/erp-mes/oee?machine_id=X&period=today|week|month */
    public function oee(Request $request): JsonResponse
    {
        $query = EdgeProductionLog::query();

        if ($machineId = $request->get('machine_id')) {
            $machine = Machine::find($machineId);
            abort_unless($machine && $this->canAccessMachine($machine, $request->user()), 403);
            $query->where('machine_id', $machineId);
        } else {
            // Scope to user's machines
            $userMachineIds = $this->scopeEdgeLogsByMachine(EdgeProductionLog::query(), $request->user())
                ->distinct()->pluck('machine_id');
            $query->whereIn('machine_id', $userMachineIds);
        }

        $period = $request->get('period', 'week');
        $query->where('recorded_at', '>=', match ($period) {
            'today'  => Carbon::today(),
            'month'  => Carbon::now()->startOfMonth(),
            default  => Carbon::now()->subDays(7),
        });

        // Per-machine OEE aggregation
        $byMachine = $query->with('machine')
            ->selectRaw('machine_id, machine_code,
                AVG(oee_percentage) as avg_oee,
                AVG(availability) as avg_availability,
                AVG(performance) as avg_performance,
                AVG(quality) as avg_quality,
                SUM(downtime_min) as total_downtime_min,
                SUM(good_quantity) as total_good,
                SUM(defect_quantity) as total_defect,
                COUNT(*) as record_count')
            ->groupBy('machine_id', 'machine_code')
            ->get()
            ->map(fn($r) => [
                'machine_id'       => $r->machine_id,
                'machine_code'     => $r->machine_code,
                'machine_name'     => $r->machine?->name ?? $r->machine_code,
                'avg_oee'          => round((float) $r->avg_oee, 1),
                'avg_availability' => round((float) $r->avg_availability, 1),
                'avg_performance'  => round((float) $r->avg_performance, 1),
                'avg_quality'      => round((float) $r->avg_quality, 1),
                'total_downtime_min' => (float) $r->total_downtime_min,
                'total_good'       => (int) $r->total_good,
                'total_defect'     => (int) $r->total_defect,
                'oee_status'       => (float) $r->avg_oee >= 85 ? 'world_class'
                    : ((float) $r->avg_oee >= 60 ? 'average' : 'poor'),
            ]);

        return $this->ok(['period' => $period, 'machines' => $byMachine]);
    }

    /** GET /v1/erp-mes/oee/history?machine_id=X&days=30 */
    public function oeeHistory(Request $request): JsonResponse
    {
        $days = min((int) $request->get('days', 14), 90);
        $query = EdgeProductionLog::query()
            ->where('recorded_at', '>=', Carbon::now()->subDays($days));

        if ($machineId = $request->get('machine_id')) {
            $machine = Machine::find($machineId);
            abort_unless($machine && $this->canAccessMachine($machine, $request->user()), 403);
            $query->where('machine_id', $machineId);
        } else {
            $userMachineIds = $this->scopeEdgeLogsByMachine(EdgeProductionLog::query(), $request->user())
                ->distinct()->pluck('machine_id');
            $query->whereIn('machine_id', $userMachineIds);
        }

        $history = $query->selectRaw(
            "DATE(recorded_at) as date,
             AVG(oee_percentage) as avg_oee,
             AVG(availability) as avg_availability,
             AVG(performance) as avg_performance,
             AVG(quality) as avg_quality,
             SUM(downtime_min) as total_downtime_min"
        )->groupByRaw('DATE(recorded_at)')->orderBy('date')->get();

        return $this->ok(['days' => $days, 'history' => $history]);
    }

    // ── Schedule (Gantt + Calendar) ───────────────────────────────────────────

    /** GET /v1/erp-mes/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD */
    public function schedule(Request $request): JsonResponse
    {
        $from = $request->get('from') ? Carbon::parse($request->get('from'))->startOfDay() : Carbon::now()->startOfMonth();
        $to   = $request->get('to')   ? Carbon::parse($request->get('to'))->endOfDay()     : Carbon::now()->endOfMonth();

        $query = $this->scopeByUser(
            WorkOrder::query()->with(['machine', 'operator']),
            $request->user()
        );

        $orders = $query->where(function ($q) use ($from, $to) {
            $q->whereBetween('planned_start_at', [$from, $to])
              ->orWhereBetween('planned_end_at', [$from, $to]);
        })->orderBy('planned_start_at')->get();

        $statusColors = [
            'draft'       => '#94a3b8',
            'released'    => '#3b82f6',
            'in_progress' => '#f59e0b',
            'completed'   => '#22c55e',
            'cancelled'   => '#ef4444',
        ];

        $items = $orders->map(fn($wo) => [
            'id'               => $wo->id,
            'code'             => $wo->code,
            'title'            => $wo->title,
            'machine_id'       => $wo->machine_id,
            'machine_name'     => $wo->machine?->name ?? '—',
            'machine_code'     => $wo->machine?->code,
            'operator_name'    => $wo->operator?->name,
            'status'           => $wo->status,
            'color'            => $statusColors[$wo->status] ?? '#94a3b8',
            'start'            => $wo->planned_start_at?->toIso8601String(),
            'end'              => $wo->planned_end_at?->toIso8601String(),
            'actual_start'     => $wo->actual_start_at?->toIso8601String(),
            'actual_end'       => $wo->actual_end_at?->toIso8601String(),
            'target_quantity'  => $wo->target_quantity,
            'completed_quantity' => $wo->completed_quantity,
            'shift'            => $wo->shift,
        ]);

        return $this->ok([
            'from'  => $from->toDateString(),
            'to'    => $to->toDateString(),
            'items' => $items,
        ]);
    }
}
