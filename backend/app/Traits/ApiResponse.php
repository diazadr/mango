<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    /**
     * Success Response.
     */
    protected function ok(mixed $data, ?string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message ?? __('api.success'),
            'data' => $data,
        ], $code);
    }

    /**
     * Error Response.
     */
    protected function error(?string $message = null, int $code = 400, mixed $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message ?? __('api.error'),
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    protected function resource(
        JsonResource|ResourceCollection $resource,
        ?string $message = null,
        int $code = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message ?? __('api.success'),
            'data' => $resource,
        ], $code);
    }
}
