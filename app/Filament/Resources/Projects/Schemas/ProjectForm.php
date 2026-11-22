<?php

declare(strict_types=1);

namespace App\Filament\Resources\Projects\Schemas;

use App\Enums\ProjectCategory;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Dados do Projeto')
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextInput::make('code')
                            ->label('Código')
                            ->required()
                            ->maxLength(32)
                            ->unique()
                            ->placeholder('Ex: 01F1CHS'),

                        Select::make('category')
                            ->label('Categoria')
                            ->options(ProjectCategory::class)
                            ->required()
                            ->searchable(),

                        TextInput::make('name')
                            ->label('Nome do Projeto')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        TagsInput::make('authors')
                            ->label('Autores')
                            ->placeholder('Digite o nome do autor e pressione Enter')
                            ->required()
                            ->columnSpanFull(),

                        TextInput::make('advisor')
                            ->label('Orientador')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('coadvisor')->label('Coorientação')->maxLength(255),
                        TextInput::make('level')->label('Nível')->required()->maxLength(255),
                        TextInput::make('city')->label('Município')->required()->maxLength(255),

                        TextInput::make('school')
                            ->label('Nome da Escola')
                            ->required()
                            ->maxLength(255),
                    ]),
            ]);
    }
}
