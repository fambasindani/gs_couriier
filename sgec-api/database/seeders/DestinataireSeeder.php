<?php

namespace Database\Seeders;

use App\Models\Destinataire;
use Illuminate\Database\Seeder;

class DestinataireSeeder extends Seeder
{
    public function run(): void
    {
        $destinataires = [
            [
                'nom' => 'Direction Générale',
                'type_destinataire' => 'INTERNE',
                'adresse' => 'Siège social',
                'telephone' => '+243 800 100 001',
                'email' => 'dg@sgec.cd',
            ],
            [
                'nom' => 'Direction DANTIC',
                'type_destinataire' => 'INTERNE',
                'adresse' => 'Siège social',
                'telephone' => '+243 800 100 002',
                'email' => 'dantic@sgec.cd',
            ],
            [
                'nom' => 'Direction Administrative et Financière',
                'type_destinataire' => 'INTERNE',
                'adresse' => 'Siège social',
                'telephone' => '+243 800 100 003',
                'email' => 'daf@sgec.cd',
            ],
            [
                'nom' => 'Ministère de la Justice',
                'type_destinataire' => 'EXTERNE',
                'adresse' => 'Kinshasa, Gombe',
                'telephone' => '+243 800 200 001',
                'email' => 'contact@justice.gouv.cd',
            ],
        ];

        foreach ($destinataires as $dest) {
            Destinataire::updateOrCreate(['nom' => $dest['nom']], $dest);
        }

        $this->command->info('✅ ' . count($destinataires) . ' destinataires créés.');
    }
}