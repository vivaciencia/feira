<?php

declare(strict_types=1);

use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        $opensAt = CarbonImmutable::parse(config('voting.opens_at'))->toIso8601String();

        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE FUNCTION protect_voting_records_from_deletion() RETURNS trigger AS $$
            BEGIN
                IF clock_timestamp() >= TG_ARGV[0]::timestamptz THEN
                    RAISE EXCEPTION 'Exclusões bloqueadas desde a abertura da votação.';
                END IF;
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql
            SQL);

        foreach (['users', 'projects'] as $table) {
            DB::unprepared("CREATE TRIGGER protect_voting_records BEFORE DELETE OR TRUNCATE ON {$table} FOR EACH STATEMENT EXECUTE FUNCTION protect_voting_records_from_deletion('{$opensAt}')");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::unprepared('DROP FUNCTION protect_voting_records_from_deletion() CASCADE');
    }
};
