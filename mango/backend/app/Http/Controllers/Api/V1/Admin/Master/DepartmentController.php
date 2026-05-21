<?php

namespace App\Http\Controllers\Api\V1\Admin\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Master\StoreDepartmentRequest;
use App\Http\Requests\Admin\Master\UpdateDepartmentRequest;
use App\Http\Resources\Admin\Master\DepartmentResource;
use App\Models\Master\Department;
use App\Services\Admin\Master\DepartmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class DepartmentController extends Controller
{
    public function __construct(
        protected DepartmentService $service
    ) {}

    /**
     * @OA\Get(
     *     path="/admin/departments",
     *     summary="List all departments (Units)",
     *     tags={"Admin Departments"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="institution_id", in="query", @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $departments = $this->service->getDepartments($request->all());

            return $this->resource(DepartmentResource::collection($departments));
        } catch (Throwable $e) {
            Log::error('Department index error', ['message' => $e->getMessage()]);

            return $this->error('Gagal mengambil data unit.', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/admin/departments",
     *     summary="Create a new unit",
     *     tags={"Admin Departments"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *             required={"name", "institution_id"},
     *
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="institution_id", type="integer")
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Created")
     * )
     */
    public function store(
        StoreDepartmentRequest $request
    ): JsonResponse {
        try {
            $department = $this->service->create($request->validated());

            return $this->resource(new DepartmentResource($department), 'Unit berhasil dibuat.', 201);
        } catch (Throwable $e) {
            Log::error('Department store error', ['message' => $e->getMessage()]);

            return $this->error('Gagal membuat unit.', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/admin/departments/{department}",
     *     summary="Show unit detail",
     *     tags={"Admin Departments"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="department", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=200, description="Detail data")
     * )
     */
    public function show(Department $department): JsonResponse
    {
        return $this->resource(new DepartmentResource(
            $department->load('institution')
        ));
    }

    /**
     * @OA\Put(
     *     path="/admin/departments/{department}",
     *     summary="Update unit info",
     *     tags={"Admin Departments"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="department", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=200, description="Updated")
     * )
     */
    public function update(
        UpdateDepartmentRequest $request,
        Department $department
    ): JsonResponse {
        try {
            $updated = $this->service->update(
                $department,
                $request->validated()
            );

            return $this->resource(new DepartmentResource($updated), 'Data unit diperbarui.');
        } catch (Throwable $e) {
            Log::error('Department update error', ['message' => $e->getMessage()]);

            return $this->error('Gagal memperbarui unit.', 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/admin/departments/{department}",
     *     summary="Delete unit",
     *     tags={"Admin Departments"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="department", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=204, description="Deleted")
     * )
     */
    public function destroy(
        Department $department
    ): JsonResponse {
        try {
            $this->service->delete($department);

            return $this->ok(null, 'Unit berhasil dihapus.', 204);
        } catch (Throwable $e) {
            Log::error('Department delete error', ['message' => $e->getMessage()]);

            return $this->error('Gagal menghapus unit.', 500);
        }
    }
}
