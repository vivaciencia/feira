<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Exception;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class VotingGoogleController
{
    public function redirect(Request $request): RedirectResponse
    {
        if (! config('services.google.client_id') || ! config('services.google.client_secret')) {
            return $this->failure('O login Google ainda não foi configurado neste ambiente.');
        }

        $project = $request->validate(['project' => ['nullable', 'string', 'max:32', 'exists:projects,code']]);
        $request->session()->put('voting.pending_project', $project['project'] ?? null);

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $identity = Socialite::driver('google')->user();
        } catch (Exception) {
            return $this->failure('Não foi possível entrar com o Google. Tente novamente.');
        }

        $googleId = $identity->getId();
        $email = Str::lower(trim((string) $identity->getEmail()));

        if (! $googleId || ! filter_var($email, FILTER_VALIDATE_EMAIL) || ($identity->getRaw()['email_verified'] ?? false) !== true) {
            return $this->failure('Use uma conta Google com e-mail verificado.');
        }

        try {
            $voter = $this->findOrCreateVoter((string) $googleId, $email, $identity->getName());
        } catch (UniqueConstraintViolationException) {
            return $this->failure('Este e-mail já está associado a outro cadastro.');
        }

        if ($voter === null) {
            return $this->failure('Este e-mail já está associado a outro cadastro.');
        }

        if ($voter->isSuspended()) {
            return $this->failure('Esta conta está indisponível para votação.');
        }

        $code = $request->session()->pull('voting.pending_project');
        $request->session()->regenerate(true);
        $request->session()->put('voting.google_user_id', $voter->getKey());

        if ($code && Project::query()->where('code', $code)->exists()) {
            $request->session()->flash('voting.confirm_project', $code);
        }

        return redirect()->route('home');
    }

    private function findOrCreateVoter(string $googleId, string $email, ?string $name): ?User
    {
        $voter = User::query()->where('google_id', $googleId)->first();
        if ($voter !== null) {
            return $voter;
        }

        if (User::query()->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            return User::query()->where('google_id', $googleId)->first();
        }

        return User::query()->firstOrCreate(['google_id' => $googleId], [
            'name' => Str::limit($name ?: 'Eleitor', 255, ''),
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Str::random(64),
        ]);
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget(['voting.google_user_id', 'voting.pending_project', 'voting.confirm_project']);
        $request->session()->regenerate(true);

        return redirect()->route('home');
    }

    private function failure(string $message): RedirectResponse
    {
        return redirect()->route('home')->with('voting.error', $message);
    }
}
