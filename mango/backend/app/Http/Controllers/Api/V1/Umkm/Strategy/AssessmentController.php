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
use Illuminate\Support\Facades\File;
use Barryvdh\DomPDF\Facade\Pdf;
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
    public function downloadPdf(
        AssessmentResult $assessment
    ) {
        $this->authorize('view', $assessment);

        $assessment->load([
            'recommendations',
            'recommendations.category',
            'umkm',
            'umkm.user',
            'umkm.organization',
        ]);

        $chartData = resolve(AssessmentService::class)->getChartData($assessment);

        $logoPath = public_path('images/logos/logo-mango.png');
        $mangoLogoBase64 = '';
        if (File::exists($logoPath)) {
            $mangoLogoBase64 = 'data:image/png;base64,' . base64_encode(File::get($logoPath));
        }

        $docUrl = config('app.frontend_url', config('app.url')) . '/id/document/assessment/' . $assessment->id;
        $qrSvgBase64 = '';
        try {
            $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                new \BaconQrCode\Renderer\RendererStyle\RendererStyle(80, 0),
                new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
            );
            $writer = new \BaconQrCode\Writer($renderer);
            $qrSvgBase64 = base64_encode($writer->writeString($docUrl));
        } catch (\Throwable $e) {}

        $docNo = 'ASM-' . str_pad($assessment->id, 6, '0', STR_PAD_LEFT);

        // Build HTML table bar chart (DomPDF doesn't reliably render inline SVG)
        $barMaxPx = 240; // px width for 100%
        $chartRows = '';
        foreach ($chartData as $d) {
            $pct   = $d['fullMark'] > 0 ? min(1, $d['score'] / $d['fullMark']) : 0;
            $barW  = (int) round($pct * $barMaxPx);
            $pctLbl = round($pct * 100);
            $color  = $pct >= 0.7 ? '#22c55e' : ($pct >= 0.4 ? '#f59e0b' : '#ef4444');
            $lbl    = htmlspecialchars($d['subject']);
            $scr    = number_format($d['score'], 1);
            $chartRows .=
                '<tr>' .
                  "<td style=\"width:130px;font-size:9.5px;color:#475569;text-align:right;padding-right:8px;padding-bottom:7px;vertical-align:middle;\">{$lbl}</td>" .
                  "<td style=\"width:{$barMaxPx}px;padding-bottom:7px;vertical-align:middle;\">" .
                    "<div style=\"background:#e2e8f0;height:18px;border-radius:4px;width:{$barMaxPx}px;\">" .
                      "<div style=\"background:{$color};height:18px;border-radius:4px;width:{$barW}px;\"></div>" .
                    "</div>" .
                  "</td>" .
                  "<td style=\"width:60px;font-size:9.5px;color:#1e293b;font-weight:bold;padding-left:8px;padding-bottom:7px;vertical-align:middle;\">{$scr}/5 <span style=\"color:#94a3b8;font-weight:normal;\">({$pctLbl}%)</span></td>" .
                '</tr>';
        }
        $chartSvg = "<table style=\"border-collapse:collapse;width:100%;\">{$chartRows}</table>";

        $pdf = Pdf::loadView('pdf.assessment', compact(
            'assessment', 'chartData', 'mangoLogoBase64', 'qrSvgBase64', 'docNo', 'chartSvg'
        ))->setPaper('a4', 'portrait');

        return $pdf->download("Assessment_{$assessment->id}.pdf");
    }
}
