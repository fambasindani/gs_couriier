<?php

namespace Database\Seeders;

use App\Models\Courrier;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourrierSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'pierrepapy@gmail.com')->first();

        $courriers = [
            [
                'numero' => 'COUR-2026-0001',
                'reference_externe' => 'MIN/BUD/2026/045',
                'type_courrier_id' => 1,
                'categorie_id' => 2,
                'priorite_id' => 3,
                'statut_id' => 3,
                'expediteur_id' => 1,
                'destinataire_id' => 1,
                'objet' => 'Transmission du rapport trimestriel d\'exécution budgétaire',
                'contenu' => 'Veuillez trouver ci-joint le rapport trimestriel d\'exécution du budget pour le T3 2026.',
                'date_courrier' => now()->subDays(2),
                'date_reception' => now()->subDays(2),
                'date_limite' => now()->addDays(5),
                'confidentialite' => 'INTERNE',
                'nombre_pieces' => 3,
                'nombre_pages' => 45,
                'created_by' => $admin->id,
            ],
            [
                'numero' => 'COUR-2026-0002',
                'reference_externe' => 'DGRAD/2026/078',
                'type_courrier_id' => 1,
                'categorie_id' => 4,
                'priorite_id' => 2,
                'statut_id' => 5,
                'expediteur_id' => 2,
                'destinataire_id' => 2,
                'objet' => 'Note de service relative à la numérisation des dossiers',
                'contenu' => 'Dans le cadre de la modernisation, veuillez procéder à la numérisation des dossiers physiques.',
                'date_courrier' => now()->subDays(3),
                'date_reception' => now()->subDays(3),
                'date_limite' => now()->addDays(10),
                'confidentialite' => 'CONFIDENTIEL',
                'nombre_pieces' => 1,
                'nombre_pages' => 12,
                'created_by' => $admin->id,
            ],
            [
                'numero' => 'COUR-2026-0003',
                'reference_externe' => 'FONDEG/2026/012',
                'type_courrier_id' => 1,
                'categorie_id' => 5,
                'priorite_id' => 1,
                'statut_id' => 2,
                'expediteur_id' => 3,
                'destinataire_id' => 3,
                'objet' => 'Demande d\'approvisionnement du stock central',
                'contenu' => 'Nous sollicitons un réapprovisionnement en fournitures de bureau.',
                'date_courrier' => now()->subDays(4),
                'date_reception' => now()->subDays(4),
                'date_limite' => now()->addDays(15),
                'confidentialite' => 'PUBLIC',
                'nombre_pieces' => 2,
                'nombre_pages' => 8,
                'created_by' => $admin->id,
            ],
        ];

        foreach ($courriers as $courrier) {
            Courrier::updateOrCreate(
                ['numero' => $courrier['numero']],
                $courrier
            );
        }

        $this->command->info('✅ ' . count($courriers) . ' courriers créés.');
    }
}