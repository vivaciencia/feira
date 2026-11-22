<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;

class VotingService
{
    public static function phase(?CarbonInterface $time = null): string
    {
        $time ??= now();

        return match (true) {
            $time->lt(CarbonImmutable::parse(config('voting.opens_at'))) => 'antes',
            $time->gte(CarbonImmutable::parse(config('voting.closes_at'))) => 'encerrada',
            default => 'aberta',
        };
    }

    /** @param array<string, int>|null $counts */
    public function snapshot(?array $counts = null): array
    {
        $counts ??= Project::query()->orderBy('code')->pluck('votes_count', 'code')->all();
        $time = now();

        return [
            'counts' => (object) $counts,
            'totalVotes' => array_sum($counts),
            'phase' => self::phase($time),
            'serverTime' => $time->toISOString(),
            'opensAt' => config('voting.opens_at'),
            'closesAt' => config('voting.closes_at'),
        ];
    }

    public function voter(Request $request): ?User
    {
        $id = $request->session()->get('voting.google_user_id');

        return $id === null ? null : User::query()->whereNotNull('google_id')
            ->whereNotNull('email_verified_at')->where('is_suspended', false)->find($id);
    }

    public function castVote(Request $request, string $code, string $token): array
    {
        $receivedAt = CarbonImmutable::createFromTimestamp($request->server->get(
            'REQUEST_TIME_FLOAT',
            $request->server->get('REQUEST_TIME', now()->getTimestamp()),
        ));
        $voter = $this->voter($request);
        if ($voter === null) {
            return ['status' => 'unauthenticated'];
        }

        $existingCode = $voter->vote?->project?->code;
        if ($existingCode !== null) {
            return ['status' => 'already_voted', 'votedCode' => $existingCode];
        }

        if (self::phase($receivedAt) !== 'aberta') {
            return ['status' => 'closed'];
        }

        $ip = $request->ip() ?? '';
        $ipKey = config('voting.ip_key') ?: config('app.key');
        $ipHash = hash_hmac('sha256', $ip, $ipKey);
        $userLimit = 'voting:account:'.$voter->getKey();
        $ipLimit = 'voting:ip:'.$ipHash;
        if (RateLimiter::tooManyAttempts($userLimit, 8)
            || RateLimiter::tooManyAttempts($ipLimit, config('voting.vote_attempts_per_ip_per_minute'))) {
            return ['status' => 'rate_limited'];
        }
        RateLimiter::hit($userLimit);
        RateLimiter::hit($ipLimit);

        $project = strlen($code) <= 32 ? Project::query()->where('code', $code)->first() : null;
        if ($project === null) {
            return ['status' => 'invalid_project'];
        }

        if (! $this->verifyTurnstile($request, $token)) {
            return ['status' => 'verification_failed'];
        }

        return $this->record($voter, $project, $ipHash);
    }

    private function record(User $voter, Project $project, string $ipHash): array
    {
        try {
            DB::transaction(function () use ($voter, $project, $ipHash): void {
                $voter->vote()->create(['project_id' => $project->getKey(), 'ip_hash' => $ipHash]);
                $project->increment('votes_count');
            }, 3);
        } catch (UniqueConstraintViolationException $exception) {
            $existingCode = $voter->vote()->with('project')->first()?->project?->code;
            if ($existingCode === null) {
                throw $exception;
            }

            return ['status' => 'already_voted', 'votedCode' => $existingCode];
        }

        return ['status' => 'ok', 'votedCode' => $project->code, 'snapshot' => $this->snapshot()];
    }

    private function verifyTurnstile(Request $request, string $token): bool
    {
        $secret = config('voting.turnstile_secret_key');
        if (! $secret || $token === '' || strlen($token) > 2048) {
            return false;
        }

        try {
            $response = Http::asForm()->timeout(5)->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => $secret,
                'response' => $token,
            ]);
        } catch (ConnectionException $exception) {
            report($exception);

            return false;
        }

        if (! $response->successful() || $response->json('success') !== true) {
            return false;
        }

        if (app()->environment('local') && $secret === '1x0000000000000000000000000000000AA') {
            return true;
        }

        return $response->json('hostname') === $request->getHost()
            && $response->json('action') === 'vote';
    }
}
