<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('direction_id')->constrained('directions')->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('libelle', 150);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->unique(['direction_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departements');
    }
};