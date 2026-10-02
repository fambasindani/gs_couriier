<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courrier_affectations', function (Blueprint $table) {
            $table->timestamp('date_accuse_reception')->nullable()->after('date_traitement');
            $table->index('date_accuse_reception');
        });
    }

    public function down(): void
    {
        Schema::table('courrier_affectations', function (Blueprint $table) {
            $table->dropIndex(['date_accuse_reception']);
            $table->dropColumn('date_accuse_reception');
        });
    }
};