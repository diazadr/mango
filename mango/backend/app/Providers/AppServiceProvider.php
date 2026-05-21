<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Gate::policy(
            \App\Models\Assessment\AssessmentResult::class,
            \App\Policies\AssessmentPolicy::class
        );
        \Illuminate\Support\Facades\Gate::policy(
            \App\Models\Umkm\Umkm::class,
            \App\Policies\UmkmPolicy::class
        );
    }
}
