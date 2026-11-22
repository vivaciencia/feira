<?php

declare(strict_types=1);

use App\Http\Controllers\AcceptInviteController;
use App\Http\Controllers\VotingGoogleController;
use App\Http\Middleware\EnsureSecurityHeaders;
use Illuminate\Support\Facades\Route;

Route::middleware(EnsureSecurityHeaders::class)->group(function (): void {
    Route::livewire('/', 'pages::home')->name('home');
    Route::livewire('/votacao/telao', 'pages::home')->name('voting.display');
    Route::middleware('throttle:voting-google')->group(function (): void {
        Route::get('/votacao/google', [VotingGoogleController::class, 'redirect'])->name('voting.google');
        Route::get('/votacao/google/callback', [VotingGoogleController::class, 'callback'])->name('voting.google.callback');
    });
    Route::post('/votacao/sair', [VotingGoogleController::class, 'logout'])->name('voting.logout');
});

// Rota de compatibilidade para middlewares que usam route('login')
Route::get('/__compat-login', fn () => redirect()->to('/login'))->name('login');

Route::get(
    config('filament-tenant-members.routes.prefix', 'invite').'/{token}',
    AcceptInviteController::class
)
    ->middleware(config('filament-tenant-members.routes.middleware', ['web', 'throttle:10,1']))
    ->name('invite.accept');
