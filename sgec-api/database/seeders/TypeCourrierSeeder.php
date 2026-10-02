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

        // Nettoyage de l'ancien code "INTERNE" (remplacé par INT_ENTRANT/INT_SORTANT)
        $obsolete = TypeCourrier::where('code', 'INTERNE')->first();
        if ($obsolete) {
            $cible = TypeCourrier::where('code', 'INT_ENTRANT')->first();
            if ($cible) {
                \App\Models\Courrier::where('type_courrier_id', $obsolete->id)
                    ->update(['type_courrier_id' => $cible->id]);
            }
            $obsolete->delete();
        }

        $this->command->info('✅ ' . count($types) . ' types de courrier créés (ancien code INTERNE supprimé).');
    }
}