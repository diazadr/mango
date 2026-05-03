<?php

namespace App\Http\Controllers\Api\V1\Admin\RBAC;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RBAC\StorePermissionRequest;
use App\Http\Requests\Admin\RBAC\UpdatePermissionRequest;
use App\Http\Resources\Admin\RBAC\PermissionResource;
use App\Services\Admin\RBAC\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;
use Throwable;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Permission::query();

            if ($search = $request->get('search')) {
                $query->where(
                    'name',
                    'like',
                    "%{$search}%"
                );
            }

            if ($module = $request->get('module')) {
                $query->where(function ($q) use ($module) {
                    $q->where('name', 'like', "{$module}.%")
                        ->orWhere('name', 'like', "{$module}_%");
                });
            }

            $sortBy = $request->get('sort_by', 'name');
            $sortDir = $request->get('sort_dir', 'asc');

            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return PermissionResource::collection(
                $query->paginate($perPage)
            );
        } catch (Throwable $e) {
            Log::error('Permission index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch permissions',
            ], 500);
        }
    }

    public function store(
        StorePermissionRequest $request,
        PermissionService $service
    ) {
        try {
            $permission = $service->create(
                $request->validated()
            );

            return (new PermissionResource($permission))
                ->response()
                ->setStatusCode(201);
        } catch (Throwable $e) {
            Log::error('Permission store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create permission',
            ], 500);
        }
    }

    public function show(Permission $permission)
    {
        try {
            return new PermissionResource(
                $permission
            );
        } catch (Throwable $e) {
            Log::error('Permission show error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch permission',
            ], 500);
        }
    }

    public function update(
        UpdatePermissionRequest $request,
        Permission $permission,
        PermissionService $service
    ) {
        try {
            $updated = $service->update(
                $permission,
                $request->validated()
            );

            return new PermissionResource(
                $updated
            );
        } catch (Throwable $e) {
            Log::error('Permission update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update permission',
            ], 500);
        }
    }

    public function destroy(
        Permission $permission,
        PermissionService $service
    ) {
        try {
            $service->delete($permission);

            return response()->noContent();
        } catch (Throwable $e) {
            Log::error('Permission delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to delete permission',
            ], 500);
        }
    }
}
