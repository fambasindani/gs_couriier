<?php

namespace Database\Seeders;

use App\Models\Courrier;
use App\Models\CourrierValidation;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourrierValidationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'pierrepapy@gmail.com')->first();
        $directeur = User::where('email', 'directeur@sgec.cd')->first();

        $courrier1 = Courrier::where('numero', 'COUR-2026-0001')->first();
        $courrier2 = Courrier::where('numero', 'COUR-2026-0002')->first();

        $validations = [
            [
                'courrier_id' => $courrier1->id,
                'user_id' => $directeur->id,
                'decision' => 'VISE',
                'commentaire' => 'Vu et transmis au DG pour validation finale.',
                'date_validation' => now()->subDays(1),
            ],
            [
                'courrier_id' => $courrier2->id,
                'user_id' => $admin->id,
                'decision' => 'VALIDE',
                'commentaire' => 'Validé pour mise en œuvre immédiate.',
                'date_validation' => now()->subHours(12),
            ],
        ];

        foreach ($validations as $v) {
            CourrierValidation::create($v);
        }

        $this->command->info('✅ ' . count($validations) . ' validations créées.');
    }
}