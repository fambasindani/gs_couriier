<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courrier_affectations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courrier_id')->constrained('courriers')->cascadeOnDelete();
            
            // Cible de l'affectation (au moins une doit être remplie)
            $table->foreignId('direction_id')->nullable()->constrained('directions')->nullOnDelete();
            $table->foreignId('departement_id')->nullable()->constrained('departements')->nullOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Qui affecte
            $table->foreignId('affecte_par')->constrained('users');
            
            // Dates
            $table->dateTime('date_affectation');
            $table->dateTime('date_limite')->nullable();
            $table->dateTime('date_prise_en_charge')->nullable();
            $table->dateTime('date_traitement')->nullable();
            
            // Statut
            $table->enum('statut', ['AFFECTE', 'PRIS_EN_CHARGE', 'EN_TRAITEMENT', 'TRAITE', 'REJETE'])
                  ->default('AFFECTE');
            
            $table->timestamps();
            
            $table->index('statut');
            $table->index('date_limite');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courrier_affectations');
    }
};