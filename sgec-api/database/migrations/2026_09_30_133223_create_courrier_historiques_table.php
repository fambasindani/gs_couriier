<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courrier_historiques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courrier_id')->constrained('courriers')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->string('action', 100);           // courrier.cree, courrier.affecte, etc.
            $table->string('etape', 100)->nullable(); // Enregistrement, Affectation, etc.
            $table->text('description')->nullable();
            
            $table->json('ancienne_valeur')->nullable();
            $table->json('nouvelle_valeur')->nullable();
            
            $table->string('adresse_ip', 45)->nullable();
            
            $table->timestamps();
            
            $table->index('courrier_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courrier_historiques');
    }
};