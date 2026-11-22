<?php

declare(strict_types=1);

namespace App\Filament\Resources\Projects\Tables;

use App\Enums\ProjectCategory;
use Filament\Actions\ActionGroup;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ProjectTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('code', 'asc')
            ->columns([
                TextColumn::make('votes_count')->label('Votos')->numeric()->sortable(),
                TextColumn::make('code')
                    ->label('Código')
                    ->badge()
                    ->color('primary')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('name')
                    ->label('Nome do Projeto')
                    ->wrap()
                    ->searchable()
                    ->sortable(),

                TextColumn::make('category')
                    ->label('Categoria')
                    ->badge()
                    ->sortable(),

                TextColumn::make('authors')
                    ->label('Autores')
                    ->badge()
                    ->color('gray')
                    ->searchable(query: function (Builder $query, string $search): Builder {
                        if ($query->getConnection()->getDriverName() === 'pgsql') {
                            return $query->whereRaw('CAST(authors AS TEXT) ILIKE ?', ["%{$search}%"]);
                        }

                        return $query->where('authors', 'like', "%{$search}%");
                    }),

                TextColumn::make('advisor')
                    ->label('Orientador')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('school')
                    ->label('Nome da Escola')
                    ->searchable()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->label('Categoria')
                    ->options(ProjectCategory::class),
            ])
            ->recordActions([
                ActionGroup::make([
                    ViewAction::make()
                        ->tooltip('Visualizar')
                        ->color('gray')
                        ->icon(Heroicon::Eye)
                        ->hiddenLabel(),

                    EditAction::make()
                        ->tooltip('Editar')
                        ->color('success')
                        ->icon(Heroicon::PencilSquare)
                        ->hiddenLabel(),

                    DeleteAction::make()
                        ->tooltip('Excluir')
                        ->icon(Heroicon::Trash)
                        ->hiddenLabel(),
                ])
                    ->buttonGroup(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
