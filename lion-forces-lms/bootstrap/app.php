<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Railway (and Hostinger, behind its own load balancer) terminate
        // TLS at the edge and forward plain HTTP to the app, so without
        // this Laravel never sees the request as secure -- it generates
        // http:// asset/URL links even though the browser is on https://,
        // which browsers block as "mixed content" and the page renders
        // blank (the CSS/JS never loads). Trusting all proxies makes
        // Laravel read the X-Forwarded-Proto header instead of guessing
        // from the raw (unencrypted-by-the-time-it-reaches-us) connection.
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\CheckMaintenanceMode::class,
        ]);

        $middleware->alias([
            'user_type' => \App\Http\Middleware\EnsureUserType::class,
            'not.content_manager' => \App\Http\Middleware\RestrictContentManagers::class,
            'check.active' => \App\Http\Middleware\CheckStudentActive::class,
            // Overrides Laravel's built-in 'verified' alias -- see
            // CheckEmailVerified's own comment.
            'verified' => \App\Http\Middleware\CheckEmailVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
