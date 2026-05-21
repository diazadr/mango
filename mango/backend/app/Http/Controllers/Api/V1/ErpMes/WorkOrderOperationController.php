<?php

namespace App\Http\Controllers\Api\V1\ErpMes;

use App\Http\Controllers\Controller;
use App\Models\Erp\WorkOrder;
use App\Models\Erp\WorkOrderOperation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class WorkOrderOperationController extends Controller
{
    /** GET /v1/erp-mes/work-orders/{workOrder}/operations */
    public function index(Request $request, WorkOrder $workOrder): JsonResponse
    {
        abort_unless($this->canAccess($workOrder, $request->user()), 403);
        $ops = $workOrder->operations()->with(['machine', 'operator'])->get();
        return response()->json(['data' => $ops->map(fn($op) => $this->format($op))]);
    }

    /** POST /v1/erp-mes/work-orders/{workOrder}/operations */
    public function store(Request $request, WorkOrder $workOrder): JsonResponse
    {
        abort_unless($this->canAccess($workOrder, $request->user()), 403);
        
        $validated = $request->validate([
            'operations'                        => ['required', 'array', 'min:1'],
            'operations.*.operation_name'       => ['required', 'string'],
            'operations.*.machine_id'           => ['nullable', 'exists:machines,id'],
            'operations.*.operator_id'          => ['nullable', 'exists:users,id'],
            'operations.*.planned_duration_min' => ['nullable', 'integer', 'min:1'],
            'operations.*.notes'                => ['nullable', 'string'],
        ]);

        try {
            // Replace existing operations
            $workOrder->operations()->delete();
            foreach ($validated['operations'] as $i => $op) {
                WorkOrderOperation::create([
                    'work_order_id'      => $workOrder->id,
                    'sequence'           => $i + 1,
                    'operation_name'     => $op['operation_name'],
                    'machine_id'         => $op['machine_id'] ?? null,
                    'operator_id'        => $op['operator_id'] ?? null,
                    'planned_duration_min' => $op['planned_duration_min'] ?? null,
                    'notes'              => $op['notes'] ?? null,
                    'status'             => 'pending',
                ]);
            }

            return response()->json([
                'message' => 'Operasi WO disimpan.',
                'data'    => $workOrder->fresh('operations.machine')->operations->map(fn($op) => $this->format($op)),
            ]);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    /** PUT /v1/erp-mes/work-orders/{workOrder}/operations/{operation} */
    public function update(Request $request, WorkOrder $workOrder, WorkOrderOperation $operation): JsonResponse
    {
        abort_unless($this->canAccess($workOrder, $request->user()), 403);
        
        $validated = $request->validate([
            'status'               => ['sometimes', 'in:pending,in_progress,done,skipped'],
            'actual_duration_min'  => ['nullable', 'integer'],
            'started_at'           => ['nullable', 'date'],
            'completed_at'         => ['nullable', 'date'],
            'notes'                => ['nullable', 'string'],
            'machine_id'           => ['nullable', 'exists:machines,id'],
            'operator_id'          => ['nullable', 'exists:users,id'],
        ]);

        // Auto set timestamps
        if (isset($validated['status'])) {
            if ($validated['status'] === 'in_progress' && !$operation->started_at) {
                $validated['started_at'] = now();
            }
            if ($validated['status'] === 'done' && !$operation->completed_at) {
                $validated['completed_at'] = now();
                if ($operation->started_at) {
                    $validated['actual_duration_min'] = (int) $operation->started_at->diffInMinutes(now());
                }
            }
        }

        $operation->update($validated);
        return response()->json(['message' => 'Operasi diperbarui.', 'data' => $this->format($operation->fresh(['machine', 'operator']))]);
    }

    /** DELETE /v1/erp-mes/work-orders/{workOrder}/operations/{operation} */
    public function destroy(Request $request, WorkOrder $workOrder, WorkOrderOperation $operation): JsonResponse
    {
        abort_unless($this->canAccess($workOrder, $request->user()), 403);
        $operation->delete();
        return response()->json(['message' => 'Operasi dihapus.']);
    }

    private function format(WorkOrderOperation $op): array
    {
        return [
            'id'                   => $op->id,
            'sequence'             => $op->sequence,
            'operation_name'       => $op->operation_name,
            'machine_id'           => $op->machine_id,
            'machine_name'         => $op->machine?->name,
            'operator_id'          => $op->operator_id,
            'operator_name'        => $op->operator?->name,
            'planned_duration_min' => $op->planned_duration_min,
            'actual_duration_min'  => $op->actual_duration_min,
            'status'               => $op->status,
            'started_at'           => $op->started_at,
            'completed_at'         => $op->completed_at,
            'notes'                => $op->notes,
        ];
    }

    private function canAccess(WorkOrder $model, \App\Models\User $user): bool
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
}
