<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Contracts\EmailVerificationResponse;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(EmailVerificationResponse::class, function () {
            $frontendUrl = config('app.frontend_url') ?: 'http://localhost:3000';
            $locale = app()->getLocale();
            return redirect($frontendUrl . "/{$locale}/verification-success");
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::redirectUserForTwoFactorAuthenticationUsing(RedirectIfTwoFactorAuthenticatable::class);

        $frontendUrl = config('app.frontend_url') ?: 'http://localhost:3000';

        Fortify::resetPasswordView(function (Request $request) use ($frontendUrl) {
            $token = $request->route('token');
            $email = $request->query('email');
            $locale = app()->getLocale();

            return redirect($frontendUrl . "/{$locale}/reset-password/{$token}?email=" . urlencode($email));
        });

        // Bind Verify Email View - This is shown when user needs to verify their email
        Fortify::verifyEmailView(function () use ($frontendUrl) {
            $locale = app()->getLocale();
            return redirect($frontendUrl . "/{$locale}/verify-email");
        });

        // Add other views just in case they are accessed directly on backend
        Fortify::loginView(function() use ($frontendUrl) {
            $locale = app()->getLocale();
            return redirect($frontendUrl . "/{$locale}/login");
        });
        Fortify::registerView(function() use ($frontendUrl) {
            $locale = app()->getLocale();
            return redirect($frontendUrl . "/{$locale}/register");
        });
        Fortify::twoFactorChallengeView(function() use ($frontendUrl) {
            $locale = app()->getLocale();
            return redirect($frontendUrl . "/{$locale}/login?two-factor=true");
        });
        Fortify::confirmPasswordView(function() use ($frontendUrl) {
            $locale = app()->getLocale();
            return redirect($frontendUrl . "/{$locale}/profile/confirm-password");
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
    }
}
