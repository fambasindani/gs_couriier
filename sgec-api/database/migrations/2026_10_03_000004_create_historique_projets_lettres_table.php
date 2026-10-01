<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historique_projets_lettres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_lettre_id')->constrained('projets_lettres')->cascadeOnDelete();
            $table->foreignId('utilisateur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('ancien_statut', 30)->nullable();
            $table->string('nouveau_statut', 30)->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamp('date_action')->nullable();
            $table->timestamps();

            $table->index('projet_lettre_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historique_projets_lettres');
    }
};
