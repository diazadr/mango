<?php

namespace App\Http\Controllers\Api\V1\Umkm\Strategy;

use App\Http\Controllers\Controller;
use App\Http\Resources\Umkm\Strategy\RecommendationResource;
use App\Models\Assessment\AssessmentResult;
use Illuminate\Support\Facades\Log;
use Throwable;

class RecommendationController extends Controller
{
    public function index(AssessmentResult $assessment)
    {
        try {
            $assessment->load([
                'recommendations',
                'recommendations.category',
            ]);

            return RecommendationResource::collection(
                $assessment->recommendations
            );
        } catch (Throwable $e) {
            Log::error('Recommendation index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch recommendations',
            ], 500);
        }
    }
}
