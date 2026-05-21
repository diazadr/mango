<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\AuthService;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class RegisterController extends Controller
{
    public function register(
        RegisterRequest $request,
        AuthService $service
    ) {
        try {
            $result = $service->register(
                $request->validated()
            );

            return response()->json([
                'token' => $result['token'],
                'user' => new UserResource($result['user']),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (Throwable $e) {
            Log::error('Register error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to register',
            ], 500);
        }
    }
}
