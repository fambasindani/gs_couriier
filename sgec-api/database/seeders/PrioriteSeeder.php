<?php

namespace Database\Seeders;

use App\Models\Priorite;
use Illuminate\Database\Seeder;

class PrioriteSeeder extends Seeder
{
    public function run(): void
    {
        $priorites = [
            ['code' => 'BASSE',   'libelle' => 'Basse',   'niveau' => 1],
            ['code' => 'NORMALE', 'libelle' => 'Normale', 'niveau' => 2],
            ['code' => 'HAUTE',   'libelle' => 'Haute',   'niveau' => 3],
            ['code' => 'URGENTE', 'libelle' => 'Urgente', 'niveau' => 4],
        ];

        foreach ($priorites as $priorite) {
            Priorite::updateOrCreate(
                ['code' => $priorite['code']],
                $priorite
            );
        }

        $this->command->info('✅ ' . count($priorites) . ' priorités créées.');
    }
}