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
use App\Models\Assessment\AssessmentCategory;
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
     * Dapatkan daftar kategori assessment untuk pilihan saat tambah note.
     */
    public function assessmentCategories(): JsonResponse
    {
        try {
            $categories = AssessmentCategory::where('is_active', true)
                ->orderBy('order')
                ->get(['id', 'name', 'slug', 'description', 'weight']);

            return $this->ok($categories);
        } catch (Throwable $e) {
            Log::error('Mentoring assessment categories error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    /**
     * Ringkasan dampak pendampingan: kategori apa yang paling banyak diperbaiki
     * dan perbandingan skor sebelum & sesudah (jika ada).
     */
    public function impactSummary(ConsultationRequest $consultation): JsonResponse
    {
        $this->authorize('view', $consultation);

        try {
            $consultation->load([
                'sessions.notes',
                'umkm',
            ]);

            $categoryCount = [];
            $sessionOutputs = [];
            $totalMeasurableImpact = 0;

            foreach ($consultation->sessions as $session) {
                foreach ($session->notes as $note) {
                    if ($note->has_measurable_impact) {
                        $totalMeasurableImpact++;
                    }

                    if (!empty($note->improved_categories)) {
                        foreach ($note->improved_categories as $catId) {
                            $categoryCount[$catId] = ($categoryCount[$catId] ?? 0) + 1;
                        }
                    }

                    if ($note->session_output) {
                        $sessionOutputs[] = [
                            'date'   => $session->scheduled_at?->toDateString(),
                            'output' => $note->session_output,
                        ];
                    }
                }
            }

            // Ambil nama kategori
            $categoryDetails = [];
            if (!empty($categoryCount)) {
                $categories = AssessmentCategory::whereIn('id', array_keys($categoryCount))
                    ->get(['id', 'name', 'slug']);
                foreach ($categories as $cat) {
                    $categoryDetails[] = [
                        'id'            => $cat->id,
                        'name'          => $cat->name,
                        'slug'          => $cat->slug,
                        'mention_count' => $categoryCount[$cat->id],
                    ];
                }
                usort($categoryDetails, fn($a, $b) => $b['mention_count'] - $a['mention_count']);
            }

            // --- PERBANDINGAN SKOR (BEFORE vs AFTER) ---
            $comparisonData = null;
            $assessmentService = app(\App\Services\Umkm\Strategy\AssessmentService::class);
            
            // Skor "Sebelum": Assessment terakhir sebelum request dibuat (atau assessment tertua yang relevan)
            $beforeAssessment = \App\Models\Assessment\AssessmentResult::where('umkm_id', $consultation->umkm_id)
                ->where('status', 'submitted')
                ->where('created_at', '<=', $consultation->created_at)
                ->latest('submitted_at')
                ->first();

            // Skor "Sesudah": Assessment terakhir saat ini
            $afterAssessment = \App\Models\Assessment\AssessmentResult::where('umkm_id', $consultation->umkm_id)
                ->where('status', 'submitted')
                ->latest('submitted_at')
                ->first();

            if ($beforeAssessment && $afterAssessment && $beforeAssessment->id !== $afterAssessment->id) {
                $beforeScores = $assessmentService->calculateCategoryScores($beforeAssessment);
                $afterScores = $assessmentService->calculateCategoryScores($afterAssessment);
                
                $chartData = [];
                $allCategories = AssessmentCategory::where('is_active', true)->orderBy('order')->get();
                
                foreach ($allCategories as $cat) {
                    $chartData[] = [
                        'category' => $cat->name,
                        'before'   => round($beforeScores[$cat->slug]['avg'] ?? 0, 2),
                        'after'    => round($afterScores[$cat->slug]['avg'] ?? 0, 2),
                    ];
                }

                $comparisonData = [
                    'before_level' => $beforeAssessment->level,
                    'after_level'  => $afterAssessment->level,
                    'chart'        => $chartData,
                ];
            }

            return $this->ok([
                'improved_categories'     => $categoryDetails,
                'session_outputs'         => $sessionOutputs,
                'measurable_impact_count' => $totalMeasurableImpact,
                'comparison'              => $comparisonData,
            ]);
        } catch (Throwable $e) {
            Log::error('Mentoring impact summary error', ['message' => $e->getMessage()]);

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
                'umkm.user',
                'department',
                'assignments.mentor',
                'sessions.notes.author',
                'projects',
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
                $request->validated()
            );

            return $this->ok(null, __('api.mentoring.note_added'));
        } catch (Throwable $e) {
            Log::error('Mentoring add note error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }

    public function complete(ConsultationRequest $consultation): JsonResponse
    {
        $this->authorize('consult', $consultation);

        try {
            $this->mentoringService->completeRequest($consultation);

            return $this->ok(null, __('api.mentoring.completed'));
        } catch (Throwable $e) {
            Log::error('Mentoring complete error', ['message' => $e->getMessage()]);

            return $this->error(__('api.error'), 500);
        }
    }
}
