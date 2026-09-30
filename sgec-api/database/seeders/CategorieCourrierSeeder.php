<?php

namespace Database\Seeders;

use App\Models\CategorieCourrier;
use Illuminate\Database\Seeder;

class CategorieCourrierSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Administratif',
            'Financier',
            'Juridique',
            'Technique',
            'Commercial',
            'Ressources humaines',
            'Correspondance générale',
        ];

        foreach ($categories as $libelle) {
            CategorieCourrier::updateOrCreate(['libelle' => $libelle]);
        }

        $this->command->info('✅ ' . count($categories) . ' catégories créées.');
    }
}