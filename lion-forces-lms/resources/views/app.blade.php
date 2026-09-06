<?php
    // Settings > General (reference screenshot): SEO meta, favicon, OG
    // image, schema JSON-LD, Google Analytics, and free-form header
    // scripts -- all admin-editable via the Setting key/value store,
    // injected globally here rather than per-page since Inertia shares
    // one root Blade view for every page.
    $metaTitle = \App\Models\Setting::get('meta_title');
    $metaDescription = \App\Models\Setting::get('meta_description');
    $metaKeywords = \App\Models\Setting::get('meta_keywords');
    $faviconPath = \App\Models\Setting::get('favicon_path');
    $ogImagePath = \App\Models\Setting::get('og_image_path');
    $schemaJsonLd = \App\Models\Setting::get('schema_jsonld');
    $analyticsScript = \App\Models\Setting::get('google_analytics_script');
    $headerScripts = \App\Models\Setting::get('header_scripts');
?><!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $metaTitle ?: config('app.name', 'Laravel') }}</title>
        @if ($metaDescription)
        <meta name="description" content="{{ $metaDescription }}">
        @endif
        @if ($metaKeywords)
        <meta name="keywords" content="{{ $metaKeywords }}">
        @endif
        @if ($metaDescription)
        <meta property="og:description" content="{{ $metaDescription }}">
        @endif
        @if ($ogImagePath)
        <meta property="og:image" content="{{ asset('storage/'.$ogImagePath) }}">
        @endif
        @if ($faviconPath)
        <link rel="icon" href="{{ asset('storage/'.$faviconPath) }}">
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700|noto-nastaliq-urdu:400,700|bebas-neue:400&display=swap" rel="stylesheet" />

        @if ($schemaJsonLd)
        <script type="application/ld+json">{!! $schemaJsonLd !!}</script>
        @endif
        @if ($analyticsScript)
        {!! $analyticsScript !!}
        @endif
        @if ($headerScripts)
        {!! $headerScripts !!}
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
