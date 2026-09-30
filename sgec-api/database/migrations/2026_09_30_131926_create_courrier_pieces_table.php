<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courrier_pieces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courrier_id')->constrained('courriers')->cascadeOnDelete();
            
            $table->string('nom_original', 255);
            $table->string('nom_fichier', 255);
            $table->string('chemin', 500);
            $table->string('extension', 20)->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->bigInteger('taille')->unsigned()->nullable();
            
            // OCR (rempli plus tard via FastAPI)
            $table->longText('texte_ocr')->nullable();
            $table->timestamp('date_ocr')->nullable();
            
            $table->boolean('est_principal')->default(false);
            
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            
            $table->index('courrier_id');
            $table->index('est_principal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courrier_pieces');
    }
};