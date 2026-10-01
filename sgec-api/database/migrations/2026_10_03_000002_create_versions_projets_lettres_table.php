<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('versions_projets_lettres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_lettre_id')->constrained('projets_lettres')->cascadeOnDelete();
            $table->unsignedInteger('numero_version');
            $table->string('chemin_fichier', 500);
            $table->string('nom_fichier_original', 255);
            $table->text('commentaire')->nullable();
            $table->foreignId('utilisateur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('date_creation')->nullable();
            $table->boolean('est_version_finale')->default(false);
            $table->timestamps();

            $table->unique(['projet_lettre_id', 'numero_version']);
            $table->index('est_version_finale');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('versions_projets_lettres');
    }
};
