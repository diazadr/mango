<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
 ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        $middleware->redirectGuestsTo(function ($request): string {
            $locale = app()->getLocale();
            $frontendUrl = rtrim(config('app.frontend_url'), '/');

            if ($request->is('email/verify/*')) {
                return "{$frontendUrl}/{$locale}/forbidden";
            }

            return "{$frontendUrl}/{$locale}/login";
        });

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn ($request, Throwable $e): bool =>
                $request->is('api/*') || $request->expectsJson()
        );

        $exceptions->render(function (Throwable $e, $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            if ($e instanceof ValidationException) {
                \Illuminate\Support\Facades\Log::error('Validation Failed', $e->errors());
                return response()->json([
                    'success' => false,
                    'message' => 'The given data was invalid.',
                    'errors' => $e->errors(),
                ], 422);
            }

            if ($e instanceof AuthenticationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                ], 401);
            }

            if ($e instanceof AuthorizationException) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'This action is unauthorized.',
                ], 403);
            }

            $status = $e instanceof HttpExceptionInterface
                ? $e->getStatusCode()
                : 500;

            return response()->json([
                'success' => false,
                'message' => $status === 500
                    ? 'Server Error'
                    : ($e->getMessage() ?: 'Request Error'),
                'code' => $status,
            ], $status);
        });
    })
    ->create();
