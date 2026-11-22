<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->unique('user_id');
            $table->foreignId('project_id')->constrained()->restrictOnDelete();
            $table->index('project_id');
            $table->string('ip_hash', 64);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
