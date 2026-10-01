<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lettre_modeles', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 150);
            $table->string('objet', 255)->nullable();
            $table->longText('corps');
            $table->foreignId('type_courrier_id')->nullable()->constrained('type_courriers')->nullOnDelete();
            $table->boolean('actif')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lettre_modeles');
    }
};
