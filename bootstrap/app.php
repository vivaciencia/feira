<?php

use App\Http\Middleware\SetCacheHeaders;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Routing\Middleware\SubstituteBindings;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        // health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->group('static', [
            SubstituteBindings::class,
            SetCacheHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('voting:publish-ranking')->everyTwoSeconds()->runInBackground();
    })
    ->withEvents(discover: false)
    ->create();
