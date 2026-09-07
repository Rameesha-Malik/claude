<?php

namespace App\Http\Middleware;

use App\Models\AnnouncementBar;
use App\Models\NavItem;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                // isContentManager drives which admin nav links render --
                // the routes are already enforced server-side regardless
                // (RestrictContentManagers middleware), this just keeps a
                // content manager from seeing links that would 403.
                'user' => fn () => $request->user()
                    ? [...$request->user()->toArray(), 'isContentManager' => $request->user()->hasRole('content_manager')]
                    : null,
            ],
            // Global site chrome — shared on every request so nav/footer/
            // announcement bar never repeat a query per page controller.
            'site' => fn () => [
                'name' => Setting::get('site_name', 'Lion Forces Academy'),
                'tagline' => Setting::get('tagline'),
                'supportEmail' => Setting::get('support_email'),
                'officeLocation' => Setting::get('office_location'),
                'officeHours' => Setting::get('office_hours'),
                'whatsappNumber' => Setting::get('whatsapp_number'),
                'whatsappEnabled' => Setting::get('whatsapp_enabled', false),
                'copyrightText' => Setting::get('copyright_text'),
                'logoPath' => Setting::get('site_logo_path'),
                'social' => [
                    'facebook' => Setting::get('social_facebook'),
                    'instagram' => Setting::get('social_instagram'),
                    'youtube' => Setting::get('social_youtube'),
                ],
            ],
            'nav' => fn () => [
                'header' => NavItem::whereNull('parent_id')->where('location', 'header')->where('is_visible', true)->orderBy('order')->get(['id', 'label', 'url']),
                'footer' => NavItem::whereNull('parent_id')->where('location', 'footer')->where('is_visible', true)->with(['children' => fn ($q) => $q->where('is_visible', true)])->orderBy('order')->get(['id', 'label', 'url', 'parent_id']),
            ],
            'announcement' => fn () => AnnouncementBar::query()
                ->where('is_active', true)
                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->latest()
                ->first(['message', 'link_url']),
            // Shared so the bell badge is correct on every student page
            // without every controller having to remember to pass it.
            'unreadNotificationsCount' => fn () => $request->user()?->unreadNotifications()->count() ?? 0,
            // Global feature toggles (Settings > Features) -- shared so any
            // layout/nav/page can hide a link without a per-page query.
            'features' => fn () => \App\Support\FeatureFlags::all(),
        ];
    }
}
