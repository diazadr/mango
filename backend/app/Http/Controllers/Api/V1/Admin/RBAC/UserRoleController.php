<?php

namespace App\Http\Controllers\Api\V1\Admin\RBAC;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RBAC\AddRoleRequest;
use App\Http\Requests\Admin\RBAC\AssignRoleRequest;
use App\Http\Requests\Admin\RBAC\RemoveRoleRequest;
use App\Http\Requests\Admin\RBAC\SyncPermissionRequest;
use App\Http\Resources\Auth\UserResource;
use App\Models\User;
use App\Services\Admin\RBAC\UserRoleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class UserRoleController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = User::query()
                ->with([
                    'roles',
                    'permissions',
                ]);

            if ($search = $request->get('search')) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($role = $request->get('role')) {
                $query->whereHas('roles', function ($builder) use ($role) {
                    $builder->where('name', $role);
                });
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');

            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return UserResource::collection(
                $query->paginate($perPage)
            );
        } catch (Throwable $e) {
            Log::error('User role index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch users',
            ], 500);
        }
    }

    public function show(User $user)
    {
        try {
            $user->load([
                'roles',
                'permissions',
            ]);

            return new UserResource(
                $user
            );
        } catch (Throwable $e) {
            Log::error('User role show error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch user roles',
            ], 500);
        }
    }

    public function assignRole(
        AssignRoleRequest $request,
        User $user,
        UserRoleService $service
    ) {
        try {
            $updated = $service->syncRoles(
                $user,
                $request->validated()
            );

            return new UserResource(
                $updated
            );
        } catch (Throwable $e) {
            Log::error('User assign role error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to assign roles',
            ], 500);
        }
    }

    public function addRole(
        AddRoleRequest $request,
        User $user,
        UserRoleService $service
    ) {
        try {
            $updated = $service->addRole(
                $user,
                $request->validated()
            );

            return new UserResource(
                $updated
            );
        } catch (Throwable $e) {
            Log::error('User add role error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to add role',
            ], 500);
        }
    }

    public function removeRole(
        RemoveRoleRequest $request,
        User $user,
        UserRoleService $service
    ) {
        try {
            $updated = $service->removeRole(
                $user,
                $request->validated()
            );

            return new UserResource(
                $updated
            );
        } catch (Throwable $e) {
            Log::error('User remove role error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to remove role',
            ], 500);
        }
    }

    public function syncPermission(
        SyncPermissionRequest $request,
        User $user,
        UserRoleService $service
    ) {
        try {
            $updated = $service->syncPermissions(
                $user,
                $request->validated()
            );

            return new UserResource(
                $updated
            );
        } catch (Throwable $e) {
            Log::error('User sync permission error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to sync permissions',
            ], 500);
        }
    }
}
