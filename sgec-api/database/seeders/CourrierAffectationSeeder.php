<?php

namespace Database\Seeders;

use App\Models\Courrier;
use App\Models\CourrierAffectation;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourrierAffectationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'pierrepapy@gmail.com')->first();
        $directeur = User::where('email', 'directeur@sgec.cd')->first();
        $agent = User::where('email', 'agent@sgec.cd')->first();

        $courrier1 = Courrier::where('numero', 'COUR-2026-0001')->first();
        $courrier2 = Courrier::where('numero', 'COUR-2026-0002')->first();
        $courrier3 = Courrier::where('numero', 'COUR-2026-0003')->first();

        $affectations = [
            // Courrier 1 → affecté à DANTIC (Département), en cours
            [
                'courrier_id' => $courrier1->id,
                'direction_id' => 1,       // DG
                'departement_id' => 2,     // DANTIC
                'service_id' => null,
                'user_id' => $directeur->id,
                'affecte_par' => $admin->id,
                'date_affectation' => now()->subDays(2),
                'date_limite' => now()->addDays(5),
                'date_prise_en_charge' => now()->subDays(2)->addHours(2),
                'statut' => 'PRIS_EN_CHARGE',
            ],
            // Courrier 2 → affecté au service Développement, en traitement
            [
                'courrier_id' => $courrier2->id,
                'direction_id' => 1,
                'departement_id' => 2,     // DANTIC
                'service_id' => 1,          // Développement
                'user_id' => $agent->id,
                'affecte_par' => $directeur->id,
                'date_affectation' => now()->subDays(3),
                'date_limite' => now()->addDays(7),
                'date_prise_en_charge' => now()->subDays(3)->addHours(1),
                'statut' => 'EN_TRAITEMENT',
            ],
            // Courrier 3 → affecté à la DAF, en attente
            [
                'courrier_id' => $courrier3->id,
                'direction_id' => 2,       // DAF
                'departement_id' => 4,     // Finances
                'service_id' => null,
                'user_id' => null,
                'affecte_par' => $admin->id,
                'date_affectation' => now()->subDay(),
                'date_limite' => now()->addDays(15),
                'statut' => 'AFFECTE',
            ],
        ];

        foreach ($affectations as $a) {
            CourrierAffectation::updateOrCreate(
                [
                    'courrier_id' => $a['courrier_id'],
                    'user_id' => $a['user_id'],
                ],
                $a
            );
        }

        $this->command->info('✅ ' . count($affectations) . ' affectations créées.');
    }
}