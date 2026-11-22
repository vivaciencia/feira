<?php

declare(strict_types=1);

namespace App\Filament\Resources\Projects\Pages;

use App\Filament\Resources\Projects\ProjectResource;
use App\Traits\Filament\HasBackButtonAction;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;
use Filament\Support\Icons\Heroicon;
use Override;

class ViewProject extends ViewRecord
{
    use HasBackButtonAction;

    protected static string $resource = ProjectResource::class;

    #[Override]
    protected function getHeaderActions(): array
    {
        return [
            $this->getBackButtonAction(),
            EditAction::make()
                ->icon(Heroicon::PencilSquare),
        ];
    }
}
