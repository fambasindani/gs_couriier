<?php

namespace Database\Seeders;

use App\Models\StatutCourrier;
use Illuminate\Database\Seeder;

class StatutCourrierSeeder extends Seeder
{
    public function run(): void
    {
        $statuts = [
            ['code' => 'ENREGISTRE', 'libelle' => 'Enregistré', 'description' => 'Courrier enregistré, en attente d\'affectation'],
            ['code' => 'AFFECTE',    'libelle' => 'Affecté',    'description' => 'Courrier affecté à un service'],
            ['code' => 'EN_COURS',   'libelle' => 'En cours',   'description' => 'Courrier en cours de traitement'],
            ['code' => 'TRAITE',     'libelle' => 'Traité',     'description' => 'Courrier traité'],
            ['code' => 'VALIDE',     'libelle' => 'Validé',     'description' => 'Courrier validé'],
            ['code' => 'CLOTURE',    'libelle' => 'Clôturé',    'description' => 'Courrier clôturé'],
            ['code' => 'REJETE',     'libelle' => 'Rejeté',     'description' => 'Courrier rejeté'],
            ['code' => 'ARCHIVE',    'libelle' => 'Archivé',    'description' => 'Courrier archivé'],
            ['code' => 'ANNULE',     'libelle' => 'Annulé',     'description' => 'Courrier annulé'],
        ];

        foreach ($statuts as $statut) {
            StatutCourrier::updateOrCreate(['code' => $statut['code']], $statut);
        }

        $this->command->info('✅ ' . count($statuts) . ' statuts créés.');
    }
}