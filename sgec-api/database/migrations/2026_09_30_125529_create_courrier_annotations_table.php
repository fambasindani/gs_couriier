<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courrier_annotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('courrier_id')->constrained('courriers')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->text('annotation');
            $table->dateTime('date_limite')->nullable();
            
            $table->enum('etat', ['EN_ATTENTE', 'EN_COURS', 'EXECUTEE', 'ANNULEE'])
                  ->default('EN_ATTENTE');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courrier_annotations');
    }
};