<?php

namespace App\Http\Controllers\Api\V1\Admin\RBAC;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RBAC\StoreUserRequest;
use App\Http\Requests\Admin\RBAC\UpdateUserRequest;
use App\Http\Resources\Auth\UserResource;
use App\Models\User;
use App\Services\Admin\RBAC\UserService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Throwable;

class UserController extends Controller
{
    public function __construct(
        protected UserService $service
    ) {}

    /**
     * @OA\Get(
     *     path="/admin/users",
     *     summary="List all users (with search and role filter)",
     *     tags={"Admin Users"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="search", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="role", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="page", in="query", @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=200, description="Users list fetched")
     * )
     */
    public function index(Request $request): JsonResponse|AnonymousResourceCollection
    {
        try {
            // Global scopes will handle organization filtering
            $users = $this->service->getUsers($request->all(), $request->user());

            return UserResource::collection($users);
        } catch (Throwable $e) {
            Log::error('User index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch users',
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/admin/users",
     *     summary="Create a new system user",
     *     tags={"Admin Users"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "role"},
     *
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8),
     *             @OA\Property(property="role", type="string", example="umkm"),
     *             @OA\Property(property="institution_id", type="integer")
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="User created")
     * )
     */
    public function store(
        StoreUserRequest $request
    ): JsonResponse {

        try {
            $this->authorize('create', User::class);

            $createdUser = $this->service->create($request->validated());

            return (new UserResource($createdUser))
                ->response()
                ->setStatusCode(201);
        } catch (Throwable $e) {
            Log::error('User store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $message = $e instanceof AuthorizationException
                ? 'You are not authorized to create users.'
                : 'Failed to create user. '.$e->getMessage();

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/admin/users/{user}",
     *     summary="Update existing user profile",
     *     tags={"Admin Users"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="role", type="string")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="User updated")
     * )
     */
    public function update(
        UpdateUserRequest $request,
        User $user
    ): JsonResponse|UserResource {
        $this->authorize('update', $user);

        try {
            $updatedUser = $this->service->update(
                $user,
                $request->validated()
            );

            return new UserResource($updatedUser);
        } catch (Throwable $e) {
            Log::error('User update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update user',
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/admin/users/{user}",
     *     summary="Delete a user (Revoke all access)",
     *     tags={"Admin Users"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="user", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=204, description="User deleted")
     * )
     */
    public function destroy(
        User $user
    ): JsonResponse {
        $this->authorize('delete', $user);

        try {
            $this->service->delete($user);

            return response()->noContent();
        } catch (Throwable $e) {
            Log::error('User delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to delete user',
            ], 500);
        }
    }
}
