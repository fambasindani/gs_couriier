<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courriers', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 100)->unique();
            $table->string('reference_externe', 150)->nullable();
            
            // Référentiels
            $table->foreignId('type_courrier_id')->constrained('type_courriers');
            $table->foreignId('categorie_id')->nullable()->constrained('categorie_courriers')->nullOnDelete();
            $table->foreignId('priorite_id')->constrained('priorites');
            $table->foreignId('statut_id')->constrained('statut_courriers');
            $table->foreignId('expediteur_id')->nullable()->constrained('expediteurs')->nullOnDelete();
            $table->foreignId('destinataire_id')->nullable()->constrained('destinataires')->nullOnDelete();
            
            // Auto-référence (réponses liées)
            $table->foreignId('courrier_parent_id')->nullable()->constrained('courriers')->nullOnDelete();
            
            // Contenu
            $table->string('objet', 500);
            $table->text('contenu')->nullable();
            
            // Dates
            $table->date('date_courrier')->nullable();
            $table->dateTime('date_reception')->nullable();
            $table->dateTime('date_limite')->nullable();
            $table->dateTime('date_cloture')->nullable();
            
            // Métadonnées
            $table->enum('confidentialite', ['PUBLIC', 'INTERNE', 'CONFIDENTIEL', 'TRES_CONFIDENTIEL'])
                  ->default('INTERNE');
            $table->integer('nombre_pieces')->default(0);
            $table->integer('nombre_pages')->default(0);
            $table->text('observation')->nullable();
            
            // Audit
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            
            // Index
            $table->index('reference_externe');
            $table->index(['date_reception', 'date_limite']);
            $table->index('statut_id');
            $table->index('confidentialite');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courriers');
    }
};