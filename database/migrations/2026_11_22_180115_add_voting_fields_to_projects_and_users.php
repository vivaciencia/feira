<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->string('level')->nullable();
            $table->string('city')->nullable();
            $table->string('coadvisor')->nullable();
            $table->unsignedInteger('votes_count')->default(0);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->string('google_id')->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['google_id']);
            $table->dropColumn('google_id');
        });

        Schema::table('projects', function (Blueprint $table): void {
            $table->dropColumn(['level', 'city', 'coadvisor', 'votes_count']);
        });
    }
};
