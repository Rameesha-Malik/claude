@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@php
    // Email logo (Admin -> Settings -> General -> Logos & branding) falls
    // back to the single site-wide logo (Admin -> Website -> Settings) so
    // this works for sites that never set a dedicated one.
    $emailLogoPath = \App\Models\Setting::get('email_logo_path') ?: \App\Models\Setting::get('site_logo_path');
@endphp
@if ($emailLogoPath)
<img src="{{ asset('storage/'.$emailLogoPath) }}" class="logo" alt="{{ $slot }}">
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>
