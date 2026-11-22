<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ProjectCategory;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('##??###')),
            'name' => fake()->sentence(4),
            'category' => fake()->randomElement(ProjectCategory::cases()),
            'authors' => [fake()->name(), fake()->name()],
            'advisor' => fake()->name(),
            'school' => fake()->company(),
            'level' => 'Ensino Médio',
            'city' => fake()->city(),
        ];
    }
}
