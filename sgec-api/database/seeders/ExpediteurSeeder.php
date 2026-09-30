<?php

namespace Database\Seeders;

use App\Models\Expediteur;
use Illuminate\Database\Seeder;

class ExpediteurSeeder extends Seeder
{
    public function run(): void
    {
        $expediteurs = [
            [
                'nom' => 'Ministère du Budget',
                'type_personne' => 'MORALE',
                'adresse' => 'Kinshasa, Gombe',
                'telephone' => '+243 800 000 001',
                'email' => 'contact@budget.gouv.cd',
            ],
            [
                'nom' => 'Direction Générale DGRAD',
                'type_personne' => 'MORALE',
                'adresse' => 'Kinshasa, Gombe',
                'telephone' => '+243 800 000 002',
                'email' => 'contact@dgrad.cd',
            ],
            [
                'nom' => 'Fondeg Catering Congo S.A.',
                'type_personne' => 'MORALE',
                'adresse' => 'Kinshasa, Limete',
                'telephone' => '+243 800 000 003',
                'email' => 'info@fondeg.cd',
            ],
            [
                'nom' => 'Jean Mukendi',
                'type_personne' => 'PHYSIQUE',
                'adresse' => 'Kinshasa, Lingwala',
                'telephone' => '+243 810 000 004',
                'email' => 'jean.mukendi@example.cd',
            ],
        ];

        foreach ($expediteurs as $exp) {
            Expediteur::updateOrCreate(['nom' => $exp['nom']], $exp);
        }

        $this->command->info('✅ ' . count($expediteurs) . ' expéditeurs créés.');
    }
}