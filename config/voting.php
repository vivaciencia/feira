<?php

declare(strict_types=1);

return [
    'opens_at' => env('VOTING_OPENS_AT', '2026-11-24T20:00:00-03:00'),
    'closes_at' => env('VOTING_CLOSES_AT', '2026-11-26T12:00:00-03:00'),
    'reverb_browser_host' => env('VITE_REVERB_HOST'),
    'reverb_browser_port' => env('VITE_REVERB_PORT'),
    'ip_key' => env('VOTING_IP_KEY'),
    'google_requests_per_ip_per_minute' => (int) env('VOTING_GOOGLE_REQUESTS_PER_IP_PER_MINUTE', 1500),
    'vote_attempts_per_ip_per_minute' => (int) env('VOTING_VOTE_ATTEMPTS_PER_IP_PER_MINUTE', 1500),
    'turnstile_site_key' => env('TURNSTILE_SITE_KEY'),
    'turnstile_secret_key' => env('TURNSTILE_SECRET_KEY'),
];
