<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Used by ImportYoutubeLessonVideo to download a pasted YouTube link
    // into a self-hosted file server-side (see that job's own comment for
    // why). Defaults assume both are on PATH; override with an absolute
    // path if the server only has them installed somewhere specific (e.g.
    // a portable binary placed outside PATH on shared hosting).
    'youtube_import' => [
        'yt_dlp_binary' => env('YT_DLP_BINARY', 'yt-dlp'),
        'ffmpeg_binary' => env('FFMPEG_BINARY', 'ffmpeg'),
    ],

];
