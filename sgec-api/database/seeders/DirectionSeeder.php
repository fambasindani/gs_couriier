<?php

namespace Database\Seeders;

use App\Models\Departement;
use App\Models\Direction;
use App\Models\Service;
use Illuminate\Database\Seeder;

class DirectionSeeder extends Seeder
{
    public function run(): void
    {
        $directions = [
            [
                'code' => 'DG',
                'libelle' => 'Direction Générale',
                'description' => 'Direction Générale de l\'entreprise',
                'departements' => [
                    [
                        'code' => 'DG-SEC',
                        'libelle' => 'Secrétariat Général',
                        'services' => [
                            ['code' => 'DG-SEC-COUR', 'libelle' => 'Bureau du Courrier'],
                            ['code' => 'DG-SEC-ARCH', 'libelle' => 'Archives'],
                        ],
                    ],
                    [
                        'code' => 'DG-DANTIC',
                        'libelle' => 'Direction des Affaires Numériques et TIC',
                        'services' => [
                            ['code' => 'DANTIC-DEV', 'libelle' => 'Développement'],
                            ['code' => 'DANTIC-RES', 'libelle' => 'Réseaux & Infrastructure'],
                        ],
                    ],
                ],
            ],
            [
                'code' => 'DAF',
                'libelle' => 'Direction Administrative et Financière',
                'description' => 'Gestion administrative et financière',
                'departements' => [
                    [
                        'code' => 'DAF-RH',
                        'libelle' => 'Ressources Humaines',
                        'services' => [
                            ['code' => 'DAF-RH-PAIE', 'libelle' => 'Paie & Social'],
                        ],
                    ],
                    [
                        'code' => 'DAF-FIN',
                        'libelle' => 'Finances',
                        'services' => [
                            ['code' => 'DAF-FIN-COM', 'libelle' => 'Comptabilité'],
                            ['code' => 'DAF-FIN-BUD', 'libelle' => 'Budget'],
                        ],
                    ],
                ],
            ],
            [
                'code' => 'DT',
                'libelle' => 'Direction Technique',
                'description' => 'Direction technique et opérationnelle',
                'departements' => [
                    [
                        'code' => 'DT-EXP',
                        'libelle' => 'Exploitation',
                        'services' => [
                            ['code' => 'DT-EXP-MNT', 'libelle' => 'Maintenance'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($directions as $data) {
            $direction = Direction::updateOrCreate(
                ['code' => $data['code']],
                [
                    'libelle' => $data['libelle'],
                    'description' => $data['description'] ?? null,
                ]
            );

            foreach ($data['departements'] as $deptData) {
                $departement = Departement::updateOrCreate(
                    ['direction_id' => $direction->id, 'code' => $deptData['code']],
                    [
                        'libelle' => $deptData['libelle'],
                        'description' => $deptData['description'] ?? null,
                    ]
                );

                foreach ($deptData['services'] as $servData) {
                    Service::updateOrCreate(
                        ['departement_id' => $departement->id, 'code' => $servData['code']],
                        [
                            'libelle' => $servData['libelle'],
                            'description' => $servData['description'] ?? null,
                        ]
                    );
                }
            }
        }

        $this->command->info('✅ Structure organisationnelle créée (3 directions, 5 départements, 7 services).');
    }
}