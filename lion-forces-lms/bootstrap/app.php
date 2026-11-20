<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

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

        // Every abort()/abort_if()/abort_unless() with a message anywhere
        // in the app (e.g. a custom quiz with no questions left to pick,
        // a mock exam with no sections yet, an assignment submitted with
        // neither text nor a file) used to throw a plain HttpException --
        // unlike $request->validate() failures, that has no redirect-back
        // behaviour, so it crashed straight out of the Inertia SPA to
        // Laravel's bare error view (or, with APP_DEBUG on, the full
        // stack-trace debug page a student should never see). This
        // reroutes those into the same page the app already renders
        // everywhere else, carrying the status and message through.
        // Deliberately excludes 500/503: those are real bugs, and this
        // app's workflow depends on seeing their actual Laravel error
        // output (locally and from client-reported screenshots) to
        // diagnose them, not a generic "something went wrong" screen.
        $exceptions->respond(function (Response $response, \Throwable $e, Request $request) {
            $status = $response->getStatusCode();

            if ($request->is('api/*') || ! in_array($status, [401, 403, 404, 419, 422, 429], true)) {
                return $response;
            }

            // A route-model-binding miss (e.g. /custom-quiz/999) throws
            // Eloquent's ModelNotFoundException with a message like "No
            // query results for model [App\Models\CustomQuizConfig] 5" --
            // technically accurate but not something to show a student.
            // Every other exception here (abort() calls, policy denials)
            // carries a message actually meant to be read.
            $message = $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? null : $e->getMessage();

            return \Inertia\Inertia::render('Error', [
                'status' => $status,
                'message' => $message ?: null,
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
