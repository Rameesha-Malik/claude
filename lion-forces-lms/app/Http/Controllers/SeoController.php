<?php

namespace App\Http\Controllers;

use App\Models\Bundle;
use App\Models\Course;
use App\Models\Setting;
use Illuminate\Http\Response;

/**
 * "robots.txt & llms.txt" / "XML Sitemap" (Settings > General reference
 * screenshot). All 3 are admin-editable/auto-generated rather than static
 * public/ files, so an admin can change them without a deploy.
 */
class SeoController extends Controller
{
    public function robots(): Response
    {
        $content = Setting::get('robots_txt') ?: "User-agent: *\nAllow: /\n\nSitemap: ".url('/sitemap.xml');

        return response($content, 200)->header('Content-Type', 'text/plain');
    }

    public function llms(): Response
    {
        $content = Setting::get('llms_txt') ?: '';

        return response($content, 200)->header('Content-Type', 'text/plain');
    }

    public function sitemap(): Response
    {
        $urls = collect([
            ['loc' => url('/'), 'priority' => '1.0'],
            ['loc' => url('/courses'), 'priority' => '0.9'],
            ['loc' => url('/practice-tests'), 'priority' => '0.8'],
            ['loc' => url('/notes'), 'priority' => '0.8'],
            ['loc' => url('/bundles'), 'priority' => '0.7'],
            ['loc' => url('/demo-quiz'), 'priority' => '0.7'],
            ['loc' => url('/about'), 'priority' => '0.5'],
            ['loc' => url('/contact'), 'priority' => '0.5'],
            ['loc' => url('/how-to-buy'), 'priority' => '0.5'],
        ]);

        Course::where('status', 'published')->get(['slug', 'updated_at'])->each(function ($c) use ($urls) {
            $urls->push(['loc' => url("/courses/{$c->slug}"), 'priority' => '0.8', 'lastmod' => $c->updated_at?->toAtomString()]);
        });

        Bundle::where('is_active', true)->get(['slug', 'updated_at'])->each(function ($b) use ($urls) {
            $urls->push(['loc' => url("/bundles/{$b->slug}"), 'priority' => '0.7', 'lastmod' => $b->updated_at?->toAtomString()]);
        });

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
