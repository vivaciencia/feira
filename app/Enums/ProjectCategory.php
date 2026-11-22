<?php

declare(strict_types=1);

namespace App\Enums;

use BackedEnum;
use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;

enum ProjectCategory: string implements HasColor, HasIcon, HasLabel
{
    case Humanas = 'humanas';
    case Biologicas = 'biologicas';
    case Quimicas = 'quimicas';
    case Saude = 'saude';
    case Exatas = 'exatas';
    case Ambiental = 'ambiental';
    case Engenharias = 'engenharias';

    public function getLabel(): string|Htmlable|null
    {
        return match ($this) {
            self::Humanas => 'Ciências Humanas e Sociais',
            self::Biologicas => 'Ciências Biológicas',
            self::Quimicas => 'Ciências Químicas e de Materiais',
            self::Saude => 'Ciências Biomédicas e da Saúde',
            self::Exatas => 'Ciências Exatas',
            self::Ambiental => 'Engenharia Energética, Agronômica e Ambiental',
            self::Engenharias => 'Engenharia Elétrica e Mecânica',
        };
    }

    public function getColor(): string|array|null
    {
        return match ($this) {
            self::Humanas => 'warning',
            self::Biologicas, self::Ambiental => 'success',
            self::Quimicas => 'primary',
            self::Saude => 'danger',
            self::Exatas => 'info',
            self::Engenharias => 'gray',
        };
    }

    public function getIcon(): string|BackedEnum|null
    {
        return match ($this) {
            self::Humanas => Heroicon::OutlinedUserGroup,
            self::Biologicas => Heroicon::OutlinedSparkles,
            self::Quimicas => Heroicon::OutlinedBeaker,
            self::Saude => Heroicon::OutlinedHeart,
            self::Exatas => Heroicon::OutlinedCalculator,
            self::Ambiental => Heroicon::OutlinedGlobeAmericas,
            self::Engenharias => Heroicon::OutlinedCpuChip,
        };
    }
}
