<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProjectCategory;
use Carbon\CarbonImmutable;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property ProjectCategory $category
 * @property array<int, string> $authors
 * @property string $advisor
 * @property string $school
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
#[Fillable([
    'code',
    'name',
    'category',
    'authors',
    'advisor',
    'school',
    'city',
    'level',
    'coadvisor',
])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /** @return HasMany<Vote, $this> */
    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    protected function casts(): array
    {
        return [
            'category' => ProjectCategory::class,
            'authors' => 'array',
            'votes_count' => 'integer',
        ];
    }
}
