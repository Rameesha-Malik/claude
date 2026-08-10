<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Vite;
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
        Vite::prefetch(concurrency: 3);

        // Outside production, throw instead of silently dropping a key that
        // isn't in a model's #[Fillable] list. Caught a real bug this way
        // during development (StudentController::toggleSuspend passed
        // 'suspended_at' before it was added to User's fillable list, and
        // it vanished with no error); left off in production so a missed
        // field degrades instead of 500ing for a live user.
        Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
    }
}
