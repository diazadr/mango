<?php

namespace App\Http\Controllers\Api\V1\Advisor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Advisor\AddNoteRequest;
use App\Http\Requests\Advisor\AssignDepartmentRequest;
use App\Http\Requests\Advisor\AssignMentorRequest;
use App\Http\Requests\Advisor\CreateConsultationRequest;
use App\Http\Requests\Advisor\CreateSessionRequest;
use App\Http\Requests\Advisor\IndexConsultationRequest;
use App\Http\Resources\Admin\Master\DepartmentResource;
use App\Http\Resources\Advisor\ConsultationRequestResource;
use App\Http\Resources\Advisor\ConsultationSessionResource;
use App\Models\Mentoring\ConsultationRequest;
use App\Models\Mentoring\ConsultationSession;
use App\Models\User;
use App\Notifications\Mentoring\AdvisorAssigned;
use App\Services\Advisor\MentoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class MentoringController extends Controller
{
    public function __construct(
        protected MentoringService $mentoringService
    ) {}

    public function departments(): JsonResponse
    {
        try {
            $departments = $this->mentoringService->getDepartments();

            return $this->resource(DepartmentResource::collection($departments));
        } catch (Throwable $e) {
            Log::error('Mentoring departments error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/v1/mentoring/requests",
     *     summary="List all mentoring requests",
     *     tags={"Mentoring"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="status", in="query", @OA\Schema(type="string")),
     *
     *     @OA\Response(response=200, description="List fetched")
     * )
     */
    public function requests(IndexConsultationRequest $request): JsonResponse
    {
        try {
            $results = $this->mentoringService->getRequests($request->validated(), $request->user());

            return $this->resource(ConsultationRequestResource::collection($results));
        } catch (Throwable $e) {
            Log::error('Mentoring request index error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/v1/mentoring/requests/{consultation}",
     *     summary="Get mentoring request detail",
     *     tags={"Mentoring"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Parameter(name="consultation", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=200, description="Detail fetched")
     * )
     */
    public function show(ConsultationRequest $consultation): JsonResponse
    {
        $this->authorize('view', $consultation);

        try {
            $consultation->load([
                'umkm',
                'department',
                'assignments.mentor',
                'sessions.notes.author',
            ]);

            return $this->resource(new ConsultationRequestResource($consultation));
        } catch (Throwable $e) {
            Log::error('Mentoring request show error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    public function createRequest(CreateConsultationRequest $request): JsonResponse
    {
        $this->authorize('create', ConsultationRequest::class);

        try {
            $consultation = $this->mentoringService->createRequest(
                $request->user(),
                $request->validated()
            );

            return $this->resource(new ConsultationRequestResource($consultation), __('api.mentoring.request_created'), 201);
        } catch (Throwable $e) {
            Log::error('Mentoring request create error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/v1/mentoring/requests/{consultation}/assign-department",
     *     summary="Assign request to a department",
     *     tags={"Mentoring"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\RequestBody(
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="department_id", type="integer")
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Assigned successfully")
     * )
     */
    public function assignDepartment(
        AssignDepartmentRequest $request,
        ConsultationRequest $consultation
    ): JsonResponse {
        $this->authorize('update', $consultation);

        try {
            $this->mentoringService->assignDepartment(
                $consultation,
                $request->validated()['department_id']
            );

            return $this->ok(null, __('api.mentoring.assigned_dept'));
        } catch (Throwable $e) {
            Log::error('Mentoring assign department error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    public function assignMentor(
        AssignMentorRequest $request,
        ConsultationRequest $consultation
    ): JsonResponse {
        $this->authorize('update', $consultation);

        try {
            $mentor = User::findOrFail($request->validated()['mentor_user_id']);

            $this->mentoringService->assignMentor(
                $consultation,
                $mentor,
                $request->user()
            );

            $mentor->notify(new AdvisorAssigned($consultation));

            return $this->ok(null, __('api.mentoring.assigned_mentor'));
        } catch (Throwable $e) {
            Log::error('Mentoring assign mentor error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    public function createSession(
        CreateSessionRequest $request,
        ConsultationRequest $consultation
    ): JsonResponse {
        $this->authorize('consult', $consultation);

        try {
            $session = $this->mentoringService->createSession(
                $consultation,
                $request->validated()
            );

            return $this->resource(new ConsultationSessionResource($session), __('api.mentoring.session_created'), 201);
        } catch (Throwable $e) {
            Log::error('Mentoring create session error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    public function addNote(
        AddNoteRequest $request,
        ConsultationSession $session
    ): JsonResponse {
        $this->authorize('consult', $session->consultationRequest);

        try {
            $this->mentoringService->addNote(
                $session,
                $request->user(),
                $request->validated()['content']
            );

            return $this->ok(null, __('api.mentoring.note_added'));
        } catch (Throwable $e) {
            Log::error('Mentoring add note error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    public function complete(ConsultationRequest $consultation): JsonResponse
    {
        $this->authorize('update', $consultation);

        try {
            $this->mentoringService->completeRequest($consultation);

            return $this->ok(null, __('api.mentoring.completed'));
        } catch (Throwable $e) {
            Log::error('Mentoring complete error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }
}
