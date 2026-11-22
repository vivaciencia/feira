<?php

declare(strict_types=1);

namespace App\Filament\Resources\Projects\Pages;

use App\Filament\Resources\Projects\ProjectResource;
use App\Traits\Filament\HasBackButtonAction;
use App\Traits\Filament\NotificationsTrait;
use Filament\Actions\DeleteAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Icons\Heroicon;
use Override;

class EditProject extends EditRecord
{
    use HasBackButtonAction;
    use NotificationsTrait;

    protected static string $resource = ProjectResource::class;

    #[Override]
    protected function getHeaderActions(): array
    {
        return [
            $this->getBackButtonAction(),
            DeleteAction::make()
                ->icon(Heroicon::Trash),
        ];
    }

    #[Override]
    protected function getSavedNotification(): ?Notification
    {
        return null;
    }

    protected function afterSave(): void
    {
        $this->notifySuccess('Projeto atualizado com sucesso.');
    }

    #[Override]
    protected function getRedirectUrl(): string
    {
        return static::getResource()::getUrl('index');
    }
}
