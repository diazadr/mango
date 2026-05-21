<?php

namespace App\Http\Middleware;

use App\Models\Edge\EdgeSite;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEdgeApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $provided = (string) ($request->header('X-EDGE-API-KEY') ?? '');

        if ($provided === '') {
            return new JsonResponse([
                'success' => false,
                'message' => 'Missing X-EDGE-API-KEY header.',
            ], 401);
        }

        // ── Try DB-backed per-site lookup first ───────────────────────────────
        $site = EdgeSite::findByApiKey($provided);

        if ($site) {
            // Inject the authenticated site into the request for downstream use
            $request->attributes->set('edge_site', $site);
            return $next($request);
        }


        return new JsonResponse([
            'success' => false,
            'message' => 'Invalid or inactive edge API key.',
        ], 401);
    }
}
