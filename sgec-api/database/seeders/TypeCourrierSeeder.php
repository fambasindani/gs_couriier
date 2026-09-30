<?php

namespace Database\Seeders;

use App\Models\TypeCourrier;
use Illuminate\Database\Seeder;

class TypeCourrierSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'ENTRANT', 'libelle' => 'Courrier entrant'],
            ['code' => 'SORTANT', 'libelle' => 'Courrier sortant'],
            ['code' => 'INTERNE', 'libelle' => 'Courrier interne'],
        ];

        foreach ($types as $type) {
            TypeCourrier::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }

        $this->command->info('✅ ' . count($types) . ' types de courrier créés.');
    }
}