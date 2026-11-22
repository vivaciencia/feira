<?php

declare(strict_types=1);

use App\Enums\ProjectCategory;
use App\Models\Project;
use App\Services\VotingService;
use Livewire\Attributes\Computed;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Title;
use Livewire\Component;

new #[Title('Votação Popular — VIVA Ciência 2026')] class extends Component
{
    #[Locked]
    public bool $display = false;

    public function mount(): void
    {
        $this->display = request()->routeIs('voting.display');
    }

    #[Computed]
    public function initialState(): array
    {
        $projects = Project::query()
            ->orderBy('name')->orderBy('code')
            ->get(['code', 'name', 'category', 'level', 'authors', 'advisor', 'coadvisor', 'school', 'city', 'votes_count']);
        $voting = resolve(VotingService::class);
        $voter = $this->display ? null : $voting->voter(request());

        return [
            'projects' => $projects->toArray(),
            'categories' => array_column(array_map(
                fn (ProjectCategory $category): array => [$category->value, $category->getLabel()],
                ProjectCategory::cases(),
            ), 1, 0),
            'snapshot' => $voting->snapshot($projects->pluck('votes_count', 'code')->all()),
            'user' => $voter?->only('name'),
            'myVote' => $voter?->vote?->project?->code,
            'googleUrl' => route('voting.google'),
            'logoutUrl' => route('voting.logout'),
            'confirmProject' => session('voting.confirm_project'),
            'error' => session('voting.error'),
            'siteKey' => config('voting.turnstile_site_key'),
            'display' => $this->display,
        ];
    }

    public function castVote(string $code, string $token): array
    {
        $this->skipRender();

        if ($this->display) {
            abort(403);
        }

        return resolve(VotingService::class)->castVote(request(), $code, $token);
    }

    public function fetchSnapshot(): array
    {
        $this->skipRender();

        return resolve(VotingService::class)->snapshot();
    }
};
