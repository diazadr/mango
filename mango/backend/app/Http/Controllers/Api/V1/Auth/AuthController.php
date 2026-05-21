<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Auth\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuthController extends Controller
{
    /**
     * @OA\Get(
     *     path="/v1/me",
     *     summary="Get authenticated user profile",
     *     tags={"Auth"},
     *     security={{"cookieAuth": {}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="User profile fetched successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Force refresh from DB to get latest email_verified_at status
            $user->refresh();

            $user->load([
                'roles',
                'institutions',
                'organizations',
                'umkm.certificationDocs',
            ]);

            Log::info('Auth me check', [
                'id' => $user->id,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'verified' => $user->email_verified_at,
            ]);

            return $this->ok([
                'user' => new UserResource($user),
                'is_super_admin' => $user->hasRole('super_admin'),
            ], 'Authenticated user fetched successfully');
        } catch (Throwable $e) {
            Log::error('Auth me error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->error('Failed to fetch authenticated user', 500);
        }
    }

    /**
     * Custom email verification endpoint that does not require auth middleware.
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        try {
            $user = User::findOrFail($id);

            if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
                return response()->json(['message' => 'Invalid verification link.'], 403);
            }

            $locale = app()->getLocale();

            if ($user->hasVerifiedEmail()) {
                return redirect(config('app.frontend_url').'/'.$locale.'/verification-success');
            }

            if ($user->markEmailAsVerified()) {
                event(new Verified($user));
            }

            return redirect(config('app.frontend_url').'/'.$locale.'/verification-success');
        } catch (Throwable $e) {
            Log::error('Email verification error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $locale = app()->getLocale();

            return redirect(config('app.frontend_url').'/'.$locale.'/login?error=verification_failed');
        }
    }
}
