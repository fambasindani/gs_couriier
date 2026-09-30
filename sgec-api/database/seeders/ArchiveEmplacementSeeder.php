<?php

namespace Database\Seeders;

use App\Models\ArchiveEmplacement;
use Illuminate\Database\Seeder;

class ArchiveEmplacementSeeder extends Seeder
{
    public function run(): void
    {
        $emplacements = [
            [
                'intitule' => 'Rayon A - Étagère 1',
                'salle' => 'Salle Archives 1',
                'description' => 'Courriers administratifs récents',
            ],
            [
                'intitule' => 'Rayon A - Étagère 2',
                'salle' => 'Salle Archives 1',
                'description' => 'Courriers administratifs anciens',
            ],
            [
                'intitule' => 'Rayon B - Étagère 1',
                'salle' => 'Salle Archives 1',
                'description' => 'Dossiers financiers',
            ],
            [
                'intitule' => 'Rayon B - Étagère 2',
                'salle' => 'Salle Archives 1',
                'description' => 'Dossiers juridiques',
            ],
            [
                'intitule' => 'Rayon C - Étagère 1',
                'salle' => 'Salle Archives 2',
                'description' => 'Ressources humaines',
            ],
            [
                'intitule' => 'Rayon C - Étagère 2',
                'salle' => 'Salle Archives 2',
                'description' => 'Documents techniques',
            ],
        ];

        foreach ($emplacements as $emp) {
            ArchiveEmplacement::updateOrCreate(
                ['intitule' => $emp['intitule']],
                $emp
            );
        }

        $this->command->info('✅ ' . count($emplacements) . ' emplacements créés.');
    }
}