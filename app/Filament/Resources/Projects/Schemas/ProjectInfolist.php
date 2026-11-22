<?php

declare(strict_types=1);

namespace App\Filament\Resources\Projects\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProjectInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Detalhes do Projeto')
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextEntry::make('code')
                            ->label('Código')
                            ->badge()
                            ->color('primary'),

                        TextEntry::make('category')
                            ->label('Categoria')
                            ->badge(),

                        TextEntry::make('name')
                            ->label('Nome do Projeto')
                            ->columnSpanFull(),

                        TextEntry::make('authors')
                            ->label('Autores')
                            ->badge()
                            ->color('gray')
                            ->columnSpanFull(),

                        TextEntry::make('advisor')
                            ->label('Orientador'),

                        TextEntry::make('coadvisor')->label('Coorientação'),
                        TextEntry::make('level')->label('Nível'),
                        TextEntry::make('city')->label('Município'),
                        TextEntry::make('votes_count')->label('Votos')->numeric(),

                        TextEntry::make('school')
                            ->label('Nome da Escola'),
                    ]),
            ]);
    }
}
