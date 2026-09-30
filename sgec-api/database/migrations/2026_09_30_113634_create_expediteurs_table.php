<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expediteurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 150);
            $table->enum('type_personne', ['PHYSIQUE', 'MORALE'])->default('MORALE');
            $table->text('adresse')->nullable();
            $table->string('telephone', 50)->nullable();
            $table->string('email', 150)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expediteurs');
    }
};