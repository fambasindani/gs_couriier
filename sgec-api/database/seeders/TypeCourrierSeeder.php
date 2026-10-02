<?php

namespace Database\Seeders;

use App\Models\TypeCourrier;
use Illuminate\Database\Seeder;

class TypeCourrierSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'ENTRANT',        'libelle' => 'Courrier externe entrant'],
            ['code' => 'SORTANT',        'libelle' => 'Courrier externe sortant'],
            ['code' => 'INT_ENTRANT',    'libelle' => 'Courrier interne entrant'],
            ['code' => 'INT_SORTANT',    'libelle' => 'Courrier interne sortant'],
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