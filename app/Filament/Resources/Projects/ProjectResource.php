<?php

declare(strict_types=1);

namespace App\Filament\Resources\Projects;

use App\Filament\Resources\Projects\Pages\CreateProject;
use App\Filament\Resources\Projects\Pages\EditProject;
use App\Filament\Resources\Projects\Pages\ListProjects;
use App\Filament\Resources\Projects\Pages\ViewProject;
use App\Filament\Resources\Projects\Schemas\ProjectForm;
use App\Filament\Resources\Projects\Schemas\ProjectInfolist;
use App\Filament\Resources\Projects\Tables\ProjectTable;
use App\Models\Project;
use App\Services\VotingService;
use App\Traits\Filament\HasConfigurableNavigationSort;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Override;
use UnitEnum;

class ProjectResource extends Resource
{
    use HasConfigurableNavigationSort;

    protected static ?string $model = Project::class;

    protected static ?string $recordTitleAttribute = 'name';

    protected static bool $isScopedToTenant = false;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedAcademicCap;

    protected static string|UnitEnum|null $navigationGroup = 'Feira Científica';

    protected static ?string $navigationLabel = 'Projetos';

    protected static ?string $modelLabel = 'Projeto';

    protected static ?string $pluralModelLabel = 'Projetos';

    protected static ?int $navigationSort = 1;

    #[Override]
    public static function canDelete(Model $record): bool
    {
        return VotingService::phase() === 'antes' && parent::canDelete($record);
    }

    #[Override]
    public static function canDeleteAny(): bool
    {
        return VotingService::phase() === 'antes' && parent::canDeleteAny();
    }

    #[Override]
    public static function form(Schema $schema): Schema
    {
        return ProjectForm::configure($schema);
    }

    #[Override]
    public static function infolist(Schema $schema): Schema
    {
        return ProjectInfolist::configure($schema);
    }

    #[Override]
    public static function table(Table $table): Table
    {
        return ProjectTable::configure($table);
    }

    #[Override]
    public static function getRelations(): array
    {
        return [];
    }

    #[Override]
    public static function getPages(): array
    {
        return [
            'index' => ListProjects::route('/'),
            'create' => CreateProject::route('/create'),
            'view' => ViewProject::route('/{record}'),
            'edit' => EditProject::route('/{record}/edit'),
        ];
    }
}
