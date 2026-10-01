<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projets_lettres', function (Blueprint $table) {
            $table->id();
            $table->string('reference_projet', 100)->unique();
            $table->foreignId('courrier_entrant_id')->nullable()->constrained('courriers')->nullOnDelete();
            $table->unsignedBigInteger('dossier_id')->nullable();
            $table->string('objet', 255);
            $table->string('destinataire', 255)->nullable();
            $table->foreignId('service_redacteur_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('createur_id')->constrained('users');
            $table->foreignId('signataire_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('statut', 30)->default('BROUILLON');
            $table->timestamp('date_creation')->nullable();
            $table->timestamp('date_soumission')->nullable();
            $table->timestamp('date_validation')->nullable();
            $table->timestamp('date_signature')->nullable();
            $table->foreignId('courrier_sortant_id')->nullable()->constrained('courriers')->nullOnDelete();
            $table->timestamp('date_expedition')->nullable();
            $table->string('mode_expedition', 50)->nullable();
            $table->timestamps();

            $table->index('statut');
            $table->index('courrier_entrant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projets_lettres');
    }
};
