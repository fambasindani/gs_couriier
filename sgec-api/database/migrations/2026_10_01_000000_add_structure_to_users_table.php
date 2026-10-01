<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('direction_id')->nullable()->after('actif')
                ->constrained('directions')->nullOnDelete();
            $table->foreignId('departement_id')->nullable()->after('direction_id')
                ->constrained('departements')->nullOnDelete();
            $table->foreignId('service_id')->nullable()->after('departement_id')
                ->constrained('services')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('direction_id');
            $table->dropConstrainedForeignId('departement_id');
            $table->dropConstrainedForeignId('service_id');
        });
    }
};
