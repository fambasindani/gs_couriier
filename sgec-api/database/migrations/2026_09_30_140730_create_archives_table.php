<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('archives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courrier_id')->nullable()->constrained('courriers')->nullOnDelete();
            $table->foreignId('archive_category_id')->nullable()->constrained('archive_categories')->nullOnDelete();
            $table->foreignId('archive_emplacement_id')->nullable()->constrained('archive_emplacements')->nullOnDelete();
            $table->foreignId('archive_par')->nullable()->constrained('users')->nullOnDelete();
            
            $table->string('cote_archive', 100)->unique();
            $table->string('titre_dossier', 255);
            $table->string('producteur_service', 150)->nullable();
            $table->string('date_periode', 100)->nullable();
            
            $table->integer('duree_conservation_ans')->default(5);
            $table->date('date_versement')->nullable();
            $table->date('date_fin_conservation')->nullable();
            
            $table->enum('statut_archive', ['ACTIF', 'VERSE', 'ELIMINE'])->default('ACTIF');
            $table->text('observation')->nullable();
            
            $table->timestamps();
            
            $table->index('cote_archive');
            $table->index('statut_archive');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archives');
    }
};