<?php

declare(strict_types=1);

namespace App\Filament\Resources\Projects\Pages;

use App\Filament\Resources\Projects\ProjectResource;
use App\Traits\Filament\HasBackButtonAction;
use App\Traits\Filament\NotificationsTrait;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Override;

class CreateProject extends CreateRecord
{
    use HasBackButtonAction;
    use NotificationsTrait;

    protected static string $resource = ProjectResource::class;

    #[Override]
    protected function getCreatedNotification(): ?Notification
    {
        return null;
    }

    protected function afterCreate(): void
    {
        $this->notifySuccess('Projeto cadastrado com sucesso.');
    }

    #[Override]
    protected function getRedirectUrl(): string
    {
        return static::getResource()::getUrl('index');
    }
}
