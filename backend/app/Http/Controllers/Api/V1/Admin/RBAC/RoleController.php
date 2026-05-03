<?php

namespace App\Http\Controllers\Api\V1\Admin\RBAC;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RBAC\StoreRoleRequest;
use App\Http\Requests\Admin\RBAC\UpdateRoleRequest;
use App\Http\Resources\Admin\RBAC\RoleResource;
use App\Services\Admin\RBAC\RoleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Throwable;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Role::query()
                ->with('permissions');

            if ($search = $request->get('search')) {
                $query->where(
                    'name',
                    'like',
                    "%{$search}%"
                );
            }

            $sortBy = $request->get('sort_by', 'name');
            $sortDir = $request->get('sort_dir', 'asc');

            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return RoleResource::collection(
                $query->paginate($perPage)
            );
        } catch (Throwable $e) {
            Log::error('Role index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch roles',
            ], 500);
        }
    }

    public function store(
        StoreRoleRequest $request,
        RoleService $service
    ) {
        try {
            $role = $service->create(
                $request->validated()
            );

            return (new RoleResource($role))
                ->response()
                ->setStatusCode(201);
        } catch (Throwable $e) {
            Log::error('Role store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create role',
            ], 500);
        }
    }

    public function show(Role $role)
    {
        try {
            $role->load('permissions');

            return new RoleResource(
                $role
            );
        } catch (Throwable $e) {
            Log::error('Role show error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch role',
            ], 500);
        }
    }

    public function update(
        UpdateRoleRequest $request,
        Role $role,
        RoleService $service
    ) {
        try {
            $updated = $service->update(
                $role,
                $request->validated()
            );

            return new RoleResource(
                $updated
            );
        } catch (Throwable $e) {
            Log::error('Role update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update role',
            ], 500);
        }
    }

    public function destroy(
        Role $role,
        RoleService $service
    ) {
        try {
            $service->delete($role);

            return response()->noContent();
        } catch (Throwable $e) {
            Log::error('Role delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to delete role',
            ], 500);
        }
    }
}
