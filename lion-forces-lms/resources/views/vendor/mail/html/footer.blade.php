@php
    $supportEmail = \App\Models\Setting::get('support_email');
@endphp
<tr>
<td>
<table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="content-cell" align="center">
{{ Illuminate\Mail\Markdown::parse($slot) }}
@if ($supportEmail)
<p>Need help? Contact us at <a href="mailto:{{ $supportEmail }}">{{ $supportEmail }}</a></p>
@endif
</td>
</tr>
</table>
</td>
</tr>
