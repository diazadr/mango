<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\Auth\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class ProfileController extends Controller
{
    /**
     * @OA\Get(
     *     path="/v1/profile",
     *     summary="Get personal profile detail",
     *     tags={"Profile"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Response(response=200, description="Profile data")
     * )
     */
    public function show(Request $request): JsonResponse
    {
        try {
            $user = $request->user()
                ->load([
                    'roles',
                    'institutions',
                    'organizations',
                    'umkm',
                    ]);
            return $this->resource(new UserResource($user), __('api.auth.profile_fetched'));
        } catch (Throwable $e) {
            Log::error('Profile show error', [
                'message' => $e->getMessage(),
            ]);

            return $this->error(__('api.error'), 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/v1/profile",
     *     summary="Update profile and avatar",
     *     tags={"Profile"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\RequestBody(
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *
     *             @OA\Schema(
     *
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="phone", type="string"),
     *                 @OA\Property(property="avatar", type="string", format="binary"),
     *                 @OA\Property(property="_method", type="string", example="PUT")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Updated")
     * )
     */
    public function update(
        UpdateProfileRequest $request,
        ProfileService $service
    ): JsonResponse {
        try {
            $user = $service->updateProfile(
                $request->user(),
                $request->validated()
            );

            return $this->resource(new UserResource($user), __('api.auth.profile_updated'));
        } catch (Throwable $e) {
            Log::error('Profile update error', [
                'message' => $e->getMessage(),
            ]);

            return $this->error(__('api.error'), 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/v1/profile/password",
     *     summary="Change account password",
     *     tags={"Profile"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Response(response=200, description="Password updated")
     * )
     */
    public function updatePassword(
        UpdatePasswordRequest $request,
        ProfileService $service
    ): JsonResponse {
        try {
            $service->updatePassword(
                $request->user(),
                $request->validated()
            );

            return $this->ok(null, __('api.auth.password_updated'));
        } catch (ValidationException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Profile password update error', [
                'message' => $e->getMessage(),
            ]);

            return $this->error(__('api.error'), 500);
        }
    }

    /**
     * Resend email verification link.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        try {
            if ($request->user()->hasVerifiedEmail()) {
                return $this->error('Email sudah terverifikasi.', 400);
            }

            $request->user()->sendEmailVerificationNotification();

            return $this->ok(null, 'Link verifikasi telah dikirim ke email Anda.');
        } catch (Throwable $e) {
            Log::error('Profile verification resend error', [
                'message' => $e->getMessage(),
            ]);

            return $this->error('Gagal mengirim link verifikasi.', 500);
        }
    }
}
