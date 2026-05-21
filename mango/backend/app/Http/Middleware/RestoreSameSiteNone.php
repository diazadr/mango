<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RestoreSameSiteNone
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Restore same_site config that was overridden by Sanctum's EnsureFrontendRequestsAreStateful
        config(['session.same_site' => env('SESSION_SAME_SITE', 'none')]);

        return $next($request);
    }
}
