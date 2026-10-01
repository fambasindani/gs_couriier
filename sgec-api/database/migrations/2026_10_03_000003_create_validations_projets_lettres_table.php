<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('validations_projets_lettres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_lettre_id')->constrained('projets_lettres')->cascadeOnDelete();
            $table->foreignId('version_projet_id')->nullable()->constrained('versions_projets_lettres')->nullOnDelete();
            $table->foreignId('valideur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('decision', ['APPROUVE', 'CORRECTION', 'REJETE']);
            $table->text('observation')->nullable();
            $table->timestamp('date_decision')->nullable();
            $table->unsignedInteger('niveau_validation')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('validations_projets_lettres');
    }
};
