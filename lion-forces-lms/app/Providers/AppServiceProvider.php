<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
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

        $this->applySettingsDrivenConfig();
    }

    // Settings > Mail and Settings > Security store SMTP credentials and
    // session lifetime as regular Setting rows (admin-editable, no
    // redeploy needed) instead of .env values -- applied here, overriding
    // whatever config/mail.php and config/session.php loaded, before
    // anything actually sends mail or reads the session lifetime.
    private function applySettingsDrivenConfig(): void
    {
        try {
            if (! Schema::hasTable('settings')) {
                return;
            }

            $lifetime = Setting::get('session_lifetime_minutes');
            if ($lifetime) {
                config(['session.lifetime' => (int) $lifetime]);
            }

            $mailHost = Setting::get('mail_host');
            if ($mailHost) {
                config([
                    'mail.mailers.smtp.host' => $mailHost,
                    'mail.mailers.smtp.port' => (int) (Setting::get('mail_port') ?: 587),
                    'mail.mailers.smtp.username' => Setting::get('mail_username'),
                    'mail.mailers.smtp.password' => Setting::get('mail_password'),
                    'mail.mailers.smtp.encryption' => Setting::get('mail_encryption', 'tls') ?: null,
                ]);

                if (! Setting::get('mail_verify_tls', true)) {
                    config(['mail.mailers.smtp.stream' => [
                        'ssl' => ['allow_self_signed' => true, 'verify_peer' => false, 'verify_peer_name' => false],
                    ]]);
                }
            }

            $fromAddress = Setting::get('mail_from_address');
            if ($fromAddress) {
                config(['mail.from.address' => $fromAddress, 'mail.from.name' => Setting::get('mail_from_name', config('mail.from.name'))]);
            }
        } catch (\Throwable $e) {
            // Never let a settings read (e.g. before the first migration
            // has run) stop the app from booting at all.
        }
    }
}
