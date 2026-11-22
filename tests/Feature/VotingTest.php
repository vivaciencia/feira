<?php

declare(strict_types=1);

use App\Events\RankingUpdated;
use App\Models\Project;
use App\Models\User;
use App\Services\VotingService;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Laravel\Socialite\Two\User as GoogleUser;

beforeEach(function (): void {
    config()->set('voting.turnstile_secret_key', 'turnstile-test');
});

function votingRequest(?User $voter, string $time = '2026-11-24T20:00:00-03:00'): Request
{
    $request = Request::create('http://localhost', 'POST', server: [
        'REQUEST_TIME_FLOAT' => strtotime($time),
        'REMOTE_ADDR' => '127.0.0.1',
    ]);
    $request->setLaravelSession(session()->driver());
    $request->session()->forget('voting.google_user_id');

    if ($voter !== null) {
        $request->session()->put('voting.google_user_id', $voter->id);
    }

    return $request;
}

it('renders both public screens with projects stored in the database and zero votes', function (): void {
    $project = Project::factory()->create(['name' => 'Projeto salvo no PostgreSQL']);

    foreach (['home', 'voting.display'] as $route) {
        $this->get(route($route))->assertOk()
            ->assertSee($project->name)->assertSee('0 votos')
            ->assertDontSee('Controles do protótipo');
    }
});

it('keeps the first vote and counts it once across repeated confirmations', function (): void {
    Http::fake(['challenges.cloudflare.com/*' => Http::response([
        'success' => true,
        'hostname' => 'localhost',
        'action' => 'vote',
    ])]);
    $voter = User::factory()->create(['google_id' => 'google-1']);
    [$first, $other] = Project::factory()->count(2)->create();
    $request = votingRequest($voter);
    $voting = resolve(VotingService::class);

    expect($voting->castVote($request, $first->code, 'captcha')['status'])->toBe('ok')
        ->and($voting->castVote($request, $other->code, 'captcha'))->toBe([
            'status' => 'already_voted',
            'votedCode' => $first->code,
        ])
        ->and($voting->snapshot()['totalVotes'])->toBe(1);

    $this->assertDatabaseCount('votes', 1);
    expect($first->refresh()->votes_count)->toBe(1)
        ->and($other->refresh()->votes_count)->toBe(0);
});

it('requires a Google session even for a user logged into the panel', function (): void {
    $user = User::factory()->create(['google_id' => 'google-1']);
    $this->actingAs($user);
    $project = Project::factory()->create();

    expect(resolve(VotingService::class)->castVote(votingRequest(null), $project->code, 'captcha'))
        ->toBe(['status' => 'unauthenticated']);
});

it('lets more than sixty browsers behind one IP start and return from Google in a minute', function (): void {
    config()->set('services.google.client_id', null);
    Socialite::shouldReceive('driver')->with('google')->times(75)->andThrow(InvalidStateException::class);
    $this->freezeTime();

    for ($browser = 0; $browser < 75; $browser++) {
        $this->withCookie(config('session.cookie'), Str::random(40));
        $this->get(route('voting.google'))->assertRedirect(route('home'));
        $this->get(route('voting.google.callback'))->assertRedirect(route('home'));
    }
});

it('limits repeated OAuth requests from one session without blocking another on the same IP', function (): void {
    config()->set('services.google.client_id', null);
    $this->freezeTime();
    $this->withCookie(config('session.cookie'), Str::random(40));

    for ($attempt = 0; $attempt < 12; $attempt++) {
        $this->get(route('voting.google'))->assertRedirect(route('home'));
    }

    $this->get(route('voting.google'))->assertTooManyRequests();
    $this->withCookie(config('session.cookie'), Str::random(40))
        ->get(route('voting.google'))->assertRedirect(route('home'));
});

it('applies the configured IP budget independently to each OAuth route', function (): void {
    config()->set('services.google.client_id', null);
    config()->set('voting.google_requests_per_ip_per_minute', 1);
    Socialite::shouldReceive('driver')->with('google')->once()->andThrow(InvalidStateException::class);
    $this->freezeTime();

    $this->withCookie(config('session.cookie'), Str::random(40))
        ->get(route('voting.google'))->assertRedirect(route('home'));
    $this->withCookie(config('session.cookie'), Str::random(40))
        ->get(route('voting.google'))->assertTooManyRequests();
    $this->get(route('voting.google.callback'))->assertRedirect(route('home'));
    $this->get(route('voting.google.callback'))->assertTooManyRequests();
});

it('lets distinct Google accounts vote from a shared IP up to the configured budget', function (): void {
    config()->set('voting.vote_attempts_per_ip_per_minute', 2);
    Http::fake(['challenges.cloudflare.com/*' => Http::response([
        'success' => true,
        'hostname' => 'localhost',
        'action' => 'vote',
    ])]);
    $project = Project::factory()->create();
    $voting = resolve(VotingService::class);

    foreach (['google-1', 'google-2', 'google-3'] as $index => $googleId) {
        $voter = User::factory()->create(['google_id' => $googleId]);
        expect($voting->castVote(votingRequest($voter), $project->code, 'captcha')['status'])
            ->toBe($index < 2 ? 'ok' : 'rate_limited');
    }

    $this->assertDatabaseCount('votes', 2);
    expect($project->refresh()->votes_count)->toBe(2);
});

it('rejects confirmations outside the server window', function (string $time): void {
    $voter = User::factory()->create(['google_id' => 'google-1']);
    $project = Project::factory()->create();

    expect(resolve(VotingService::class)->castVote(votingRequest($voter, $time), $project->code, 'captcha'))
        ->toBe(['status' => 'closed']);
    $this->assertDatabaseCount('votes', 0);
})->with(['2026-11-24T19:59:59-03:00', '2026-11-26T12:00:00-03:00']);

it('leaves the project unchanged when the captcha fails', function (): void {
    Http::fake(['challenges.cloudflare.com/*' => Http::response(['success' => false])]);
    $voter = User::factory()->create(['google_id' => 'google-1']);
    $project = Project::factory()->create();

    expect(resolve(VotingService::class)->castVote(votingRequest($voter), $project->code, 'invalid'))
        ->toBe(['status' => 'verification_failed']);
    $this->assertDatabaseCount('votes', 0);
    expect($project->refresh()->votes_count)->toBe(0);
});

it('restores a vote session from the same verified Google account across email changes', function (): void {
    $voter = User::factory()->create(['google_id' => 'google-1']);
    $project = Project::factory()->create();
    $voter->vote()->create(['project_id' => $project->id, 'ip_hash' => str_repeat('0', 64)]);

    $identity = (new GoogleUser)->setRaw(['email_verified' => true])->map([
        'id' => 'google-1',
        'email' => 'updated@example.org',
        'name' => 'Votante',
    ]);
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($identity);
    Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);

    $this->withSession(['voting.pending_project' => $project->code])
        ->get(route('voting.google.callback'))
        ->assertRedirect(route('home'))
        ->assertSessionHas('voting.google_user_id', $voter->id)
        ->assertSessionHas('voting.confirm_project', $project->code);
    $this->assertDatabaseCount('users', 1);
    $this->assertDatabaseCount('votes', 1);
    $this->assertDatabaseCount('authentication_log', 0);
});

it('publishes a changed phase without requiring any vote', function (): void {
    Event::fake([RankingUpdated::class]);
    $this->travelTo(now()->parse('2026-11-24T19:59:59-03:00'));
    $this->artisan('voting:publish-ranking')->assertSuccessful();
    $this->artisan('voting:publish-ranking')->assertSuccessful();
    $this->travelTo(now()->parse('2026-11-24T20:00:00-03:00'));
    $this->artisan('voting:publish-ranking')->assertSuccessful();

    Event::assertDispatchedTimes(RankingUpdated::class, 2);
    Event::assertDispatched(RankingUpdated::class, fn (RankingUpdated $event): bool => $event->broadcastWith()['phase'] === 'aberta'
        && $event->broadcastWith()['totalVotes'] === 0);
});

it('creates a voter from a verified email without opening a panel session', function (): void {
    $identity = (new GoogleUser)->setRaw(['email_verified' => true])->map([
        'id' => 'new-google-account',
        'email' => 'NEW@example.org',
        'name' => 'Nova Eleitora',
    ]);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->once()->andReturn($identity);
    Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);

    $response = $this->get(route('voting.google.callback'))->assertRedirect(route('home'));
    $voter = User::query()->where('google_id', 'new-google-account')->sole();

    $response->assertSessionHas('voting.google_user_id', $voter->id);
    expect($voter->email)->toBe('new@example.org')->and($voter->is_approved)->toBeFalse();
    $this->assertGuest();
});

it('keeps the database constraint against duplicate votes', function (): void {
    $voter = User::factory()->create(['google_id' => 'google-1']);
    [$first, $other] = Project::factory()->count(2)->create();
    $voter->vote()->create(['project_id' => $first->id, 'ip_hash' => str_repeat('0', 64)]);

    expect(fn () => DB::transaction(fn () => $voter->vote()->create([
        'project_id' => $other->id,
        'ip_hash' => str_repeat('0', 64),
    ])))->toThrow(UniqueConstraintViolationException::class);

    $this->assertDatabaseCount('votes', 1);
    expect($voter->vote()->sole()->project_id)->toBe($first->id);
});

it('blocks direct deletion of users and projects after opening even if they have no votes', function (): void {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('This check exercises PostgreSQL triggers.');
    }

    config()->set('voting.opens_at', now()->subMinute()->toISOString());
    $migration = require database_path('migrations/2026_11_22_180216_protect_voting_records_from_deletion.php');
    $migration->down();
    $migration->up();

    $user = User::factory()->create();
    $project = Project::factory()->create();

    foreach (['users' => $user->id, 'projects' => $project->id] as $table => $id) {
        expect(fn () => DB::transaction(fn () => DB::table($table)->where('id', $id)->delete()))
            ->toThrow(QueryException::class, 'Exclusões bloqueadas');
        $this->assertDatabaseHas($table, ['id' => $id]);
    }
});
