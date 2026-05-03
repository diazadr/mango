<?php

namespace App\Http\Controllers\Api\V1\Umkm\Strategy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\Strategy\IndexAssessmentRequest;
use App\Http\Requests\Umkm\Strategy\StoreAssessmentRequest;
use App\Http\Requests\Umkm\Strategy\SubmitAnswersRequest;
use App\Http\Resources\Umkm\Strategy\AssessmentCategoryResource;
use App\Http\Resources\Umkm\Strategy\AssessmentResultResource;
use App\Models\Assessment\AssessmentResult;
use App\Services\Umkm\Strategy\AssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Throwable;

class AssessmentController extends Controller
{
    public function __construct(
        protected AssessmentService $assessmentService
    ) {}

    public function questions(): JsonResponse|AnonymousResourceCollection
    {
        try {
            $categories = $this->assessmentService->getQuestions();

            return AssessmentCategoryResource::collection(
                $categories
            );
        } catch (Throwable $e) {
            Log::error('Assessment questions error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch questions',
            ], 500);
        }
    }

    public function index(
        IndexAssessmentRequest $request
    ): JsonResponse|AnonymousResourceCollection {
        try {
            $results = $this->assessmentService->getAssessments(
                $request->validated(),
                $request->user()
            );

            return AssessmentResultResource::collection(
                $results
            );
        } catch (Throwable $e) {
            Log::error('Assessment index error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch assessments',
            ], 500);
        }
    }

    public function store(
        StoreAssessmentRequest $request
    ): JsonResponse|AssessmentResultResource {
        try {
            $assessment = $this->assessmentService
                ->getOrCreateDraft(
                    $request->validated()['umkm_id'],
                    $request->user()->id
                );

            return new AssessmentResultResource(
                $assessment
            );
        } catch (Throwable $e) {
            Log::error('Assessment store error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to create assessment',
            ], 500);
        }
    }

    public function show(
        AssessmentResult $assessment
    ): JsonResponse|AssessmentResultResource {
        $this->authorize('view', $assessment);

        try {
            $assessment->load([
                'answers.question.category',
                'recommendations',
                'recommendations.category',
                'umkm',
            ]);

            return new AssessmentResultResource(
                $assessment
            );
        } catch (Throwable $e) {
            Log::error('Assessment show error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch assessment',
            ], 500);
        }
    }

    public function submitAnswers(
        SubmitAnswersRequest $request,
        AssessmentResult $assessment
    ): JsonResponse {
        $this->authorize('update', $assessment);

        try {
            $this->assessmentService->submitAnswers(
                $assessment,
                $request->validated()['answers']
            );

            return response()->json([
                'message' => 'Answers saved successfully',
            ]);
        } catch (Throwable $e) {
            Log::error(
                'Assessment answer submit error',
                ['message' => $e->getMessage()]
            );

            return response()->json([
                'message' => 'Failed to save answers',
            ], 500);
        }
    }

    public function calculateScore(
        AssessmentResult $assessment
    ): JsonResponse|AssessmentResultResource {
        $this->authorize('update', $assessment);

        try {
            $processed = $this->assessmentService
                ->process($assessment);

            return new AssessmentResultResource(
                $processed
            );
        } catch (Throwable $e) {
            Log::error('Assessment calculate error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to calculate score',
            ], 500);
        }
    }
}
