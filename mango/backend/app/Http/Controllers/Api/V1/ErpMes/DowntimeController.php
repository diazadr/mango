<?php

namespace App\Http\Controllers\Api\V1\ErpMes;

use App\Http\Controllers\Controller;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Models\Mes\DowntimeLog;
use App\Models\Machine\Machine;
use App\Models\Umkm\Umkm;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Throwable;

class DowntimeController extends Controller
{
    /** GET /v1/erp-mes/downtime */
    public function index(Request $request): JsonResponse
    {
        $query = DowntimeLog::with(['machine', 'workOrder'])
            ->orderByDesc('started_at');
        
        $query = $this->scopeByMachineOwner($query, $request->user());

        if ($machineId = $request->get('machine_id')) {
            $query->where('machine_id', $machineId);
        }
        if ($source = $request->get('source')) {
            $query->where('source', $source);
        }
        if ($from = $request->get('from')) {
            $query->where('started_at', '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to = $request->get('to')) {
            $query->where('started_at', '<=', Carbon::parse($to)->endOfDay());
        }

        $perPage = min((int) $request->get('per_page', 50), 200);
        $logs = $query->paginate($perPage);

        return response()->json([
            'data' => $logs->items() ? collect($logs->items())->map(fn($l) => $this->format($l)) : [],
            'meta' => [
                'total'        => $logs->total(),
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
            ],
        ]);
    }

    /** GET /v1/erp-mes/downtime/summary — distribusi per reason_code */
    public function summary(Request $request): JsonResponse
    {
        $query = DowntimeLog::query();
        $query = $this->scopeByMachineOwner($query, $request->user());

        if ($machineId = $request->get('machine_id')) {
            $query->where('machine_id', $machineId);
        }
        if ($from = $request->get('from')) {
            $query->where('started_at', '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to = $request->get('to')) {
            $query->where('started_at', '<=', Carbon::parse($to)->endOfDay());
        }

        $byReason = (clone $query)
            ->selectRaw('reason_code, COUNT(*) as count, SUM(duration_min) as total_min')
            ->groupBy('reason_code')
            ->get()
            ->map(fn($r) => [
                'reason_code'  => $r->reason_code,
                'label'        => DowntimeLog::reasonCodeLabel($r->reason_code),
                'count'        => (int) $r->count,
                'total_min'    => (float) $r->total_min,
            ]);

        return response()->json([
            'total_events'    => (clone $query)->count(),
            'total_min'       => (float) (clone $query)->sum('duration_min'),
            'by_reason'       => $byReason,
            'planned_min'     => (float) (clone $query)->where('is_planned', true)->sum('duration_min'),
            'unplanned_min'   => (float) (clone $query)->where('is_planned', false)->sum('duration_min'),
        ]);
    }

    /** POST /v1/erp-mes/downtime — manual start */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'machine_id'     => ['required', 'exists:machines,id'],
            'work_order_id'  => ['nullable', 'exists:work_orders,id'],
            'reason_code'    => ['required', 'string'],
            'description'    => ['nullable', 'string'],
            'is_planned'     => ['nullable', 'boolean'],
            'started_at'     => ['nullable', 'date'],
            'ended_at'       => ['nullable', 'date', 'after:started_at'],
        ]);

        $machine = Machine::find($validated['machine_id']);
        abort_unless($machine && $this->canAccessMachine($machine, $request->user()), 403);

        try {
            $log = DowntimeLog::create([
                'machine_id'    => $validated['machine_id'],
                'work_order_id' => $validated['work_order_id'] ?? null,
                'source'        => 'manual',
                'started_at'    => $validated['started_at'] ?? now(),
                'ended_at'      => $validated['ended_at'] ?? null,
                'reason_code'   => strtoupper($validated['reason_code']),
                'description'   => $validated['description'] ?? null,
                'is_planned'    => $validated['is_planned'] ?? false,
            ]);

            return response()->json(['message' => 'Downtime dicatat.', 'data' => $this->format($log->fresh(['machine']))], 201);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Gagal mencatat downtime: ' . $e->getMessage()], 500);
        }
    }

    /** PATCH /v1/erp-mes/downtime/{id}/stop */
    public function stop(DowntimeLog $downtime): JsonResponse
    {
        abort_unless($downtime->machine && $this->canAccessMachine($downtime->machine, request()->user()), 403);

        if ($downtime->ended_at) {
            return response()->json(['message' => 'Downtime sudah selesai.'], 422);
        }
        $downtime->update(['ended_at' => now()]);
        return response()->json(['message' => 'Downtime dihentikan.', 'data' => $this->format($downtime->fresh())]);
    }

    /** DELETE /v1/erp-mes/downtime/{id} */
    public function destroy(DowntimeLog $downtime): JsonResponse
    {
        abort_unless($downtime->machine && $this->canAccessMachine($downtime->machine, request()->user()), 403);

        $downtime->delete();
        return response()->json(['message' => 'Downtime dihapus.']);
    }

    private function format(DowntimeLog $log): array
    {
        return [
            'id'           => $log->id,
            'machine'      => $log->machine ? ['id' => $log->machine->id, 'name' => $log->machine->name, 'code' => $log->machine->code] : null,
            'work_order'   => $log->workOrder ? ['id' => $log->workOrder->id, 'code' => $log->workOrder->code] : null,
            'source'       => $log->source,
            'source_badge' => $log->source === 'edge' ? 'IoT Edge' : 'Manual',
            'started_at'   => $log->started_at,
            'ended_at'     => $log->ended_at,
            'duration_min' => $log->duration_min,
            'reason_code'  => $log->reason_code,
            'reason_label' => DowntimeLog::reasonCodeLabel($log->reason_code),
            'description'  => $log->description,
            'is_planned'   => $log->is_planned,
            'is_active'    => is_null($log->ended_at),
        ];
    }

    private function scopeByMachineOwner(\Illuminate\Database\Eloquent\Builder $query, \App\Models\User $user): \Illuminate\Database\Eloquent\Builder
    {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        if ($user->umkm) {
            return $query->whereNotNull('machine_id')->whereHas('machine', function (\Illuminate\Database\Eloquent\Builder $m) use ($user): void {
                $m->where('owner_type', \App\Models\Umkm\Umkm::class)->where('owner_id', $user->umkm->id);
            });
        }

        $institutionIds = $user->institutions()->pluck('institutions.id')->filter()->values();
        $organizationIds = $user->organizations()->pluck('organizations.id')->filter()->values();

        if ($institutionIds->isEmpty() && $organizationIds->isEmpty()) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereNotNull('machine_id')->whereHas('machine', function (\Illuminate\Database\Eloquent\Builder $m) use ($institutionIds, $organizationIds): void {
            $m->where(function (\Illuminate\Database\Eloquent\Builder $inner) use ($institutionIds, $organizationIds): void {
                if ($institutionIds->isNotEmpty()) {
                    $inner->orWhere(function (\Illuminate\Database\Eloquent\Builder $i) use ($institutionIds): void {
                        $i->where('owner_type', \App\Models\Master\Institution::class)->whereIn('owner_id', $institutionIds);
                    });
                }
                if ($organizationIds->isNotEmpty()) {
                    $inner->orWhere(function (\Illuminate\Database\Eloquent\Builder $o) use ($organizationIds): void {
                        $o->where('owner_type', \App\Models\Master\Organization::class)->whereIn('owner_id', $organizationIds);
                    });
                }
            });
        });
    }

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
}
