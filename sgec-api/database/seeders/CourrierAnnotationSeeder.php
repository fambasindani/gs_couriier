<?php

namespace Database\Seeders;

use App\Models\Courrier;
use App\Models\CourrierAnnotation;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourrierAnnotationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'pierrepapy@gmail.com')->first();
        $directeur = User::where('email', 'directeur@sgec.cd')->first();

        $courrier1 = Courrier::where('numero', 'COUR-2026-0001')->first();
        $courrier2 = Courrier::where('numero', 'COUR-2026-0002')->first();

        $annotations = [
            [
                'courrier_id' => $courrier1->id,
                'user_id' => $admin->id,
                'annotation' => 'Merci de préparer une note de synthèse pour le DG avant vendredi.',
                'date_limite' => now()->addDays(3),
                'etat' => 'EN_ATTENTE',
            ],
            [
                'courrier_id' => $courrier1->id,
                'user_id' => $directeur->id,
                'annotation' => 'Analyse préliminaire effectuée, en attente de validation budgétaire.',
                'date_limite' => now()->addDays(5),
                'etat' => 'EN_COURS',
            ],
            [
                'courrier_id' => $courrier2->id,
                'user_id' => $admin->id,
                'annotation' => 'Priorité haute : la numérisation doit démarrer ce mois-ci.',
                'date_limite' => now()->addDays(7),
                'etat' => 'EN_ATTENTE',
            ],
        ];

        foreach ($annotations as $a) {
            CourrierAnnotation::create($a);
        }

        $this->command->info('✅ ' . count($annotations) . ' annotations créées.');
    }
}