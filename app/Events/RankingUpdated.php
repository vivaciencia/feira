<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class RankingUpdated implements ShouldBroadcastNow
{
    public function __construct(private readonly array $snapshot) {}

    public function broadcastOn(): Channel
    {
        return new Channel('voting.ranking');
    }

    public function broadcastAs(): string
    {
        return 'ranking.updated';
    }

    public function broadcastWith(): array
    {
        return $this->snapshot;
    }
}
