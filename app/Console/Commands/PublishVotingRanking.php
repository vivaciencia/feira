<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Events\RankingUpdated;
use App\Services\VotingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Throwable;

class PublishVotingRanking extends Command
{
    protected $signature = 'voting:publish-ranking {--force : Publish even if the snapshot has not changed}';

    protected $description = 'Publish the current voting ranking on Reverb';

    public function handle(VotingService $voting): int
    {
        try {
            Cache::lock('voting:publish-ranking', 30)->get(function () use ($voting): void {
                $snapshot = $voting->snapshot();
                $revision = hash('sha256', json_encode([$snapshot['phase'], $snapshot['counts']], JSON_THROW_ON_ERROR));
                if (! $this->option('force') && Cache::get('voting:last-published-ranking') === $revision) {
                    return;
                }

                event(new RankingUpdated($snapshot));
                Cache::put('voting:last-published-ranking', $revision, now()->addMinute());
                $this->info('Ranking publicado. Total de votos: '.$snapshot['totalVotes']);
            });
        } catch (Throwable $exception) {
            report($exception);
            $this->error('Não foi possível publicar o ranking.');

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
