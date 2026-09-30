<?php

namespace Database\Seeders;

use App\Models\ArchiveCategory;
use Illuminate\Database\Seeder;

class ArchiveCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['libelle' => 'Courriers administratifs',    'description' => 'Correspondance administrative générale'],
            ['libelle' => 'Dossiers financiers',         'description' => 'Factures, budgets, rapports financiers'],
            ['libelle' => 'Dossiers juridiques',         'description' => 'Contrats, actes juridiques'],
            ['libelle' => 'Ressources humaines',         'description' => 'Dossiers du personnel'],
            ['libelle' => 'Correspondance officielle',   'description' => 'Lettres officielles, notes de service'],
            ['libelle' => 'Documents techniques',        'description' => 'Rapports, études, plans'],
        ];

        foreach ($categories as $cat) {
            ArchiveCategory::updateOrCreate(
                ['libelle' => $cat['libelle']],
                $cat
            );
        }

        $this->command->info('✅ ' . count($categories) . ' catégories d\'archives créées.');
    }
}