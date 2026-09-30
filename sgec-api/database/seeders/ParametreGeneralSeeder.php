<?php

namespace Database\Seeders;

use App\Models\ParametreGeneral;
use Illuminate\Database\Seeder;

class ParametreGeneralSeeder extends Seeder
{
    public function run(): void
    {
        $parametres = [
            ['cle' => 'app_nom',                  'valeur' => 'SGEC', 'type' => 'string', 'groupe' => 'general',  'description' => 'Nom de l\'application'],
            ['cle' => 'app_sigle',                'valeur' => 'SGEC', 'type' => 'string', 'groupe' => 'general',  'description' => 'Sigle officiel'],
            ['cle' => 'organisation_nom',         'valeur' => 'Entreprise publique de la RDC', 'type' => 'string', 'groupe' => 'general', 'description' => 'Nom de l\'organisation'],
            ['cle' => 'pays',                     'valeur' => 'RDC',  'type' => 'string', 'groupe' => 'general',  'description' => 'Pays'],
            ['cle' => 'devise',                   'valeur' => 'CDF',  'type' => 'string', 'groupe' => 'general',  'description' => 'Devise monétaire'],
            ['cle' => 'fuseau_horaire',           'valeur' => 'Africa/Kinshasa', 'type' => 'string', 'groupe' => 'general', 'description' => 'Fuseau horaire'],
            ['cle' => 'langue_defaut',            'valeur' => 'fr',   'type' => 'string', 'groupe' => 'general',  'description' => 'Langue par défaut'],

            ['cle' => 'numero_format',            'valeur' => 'COUR-{ANNEE}-{NUM}', 'type' => 'string', 'groupe' => 'courrier', 'description' => 'Format de numérotation des courriers'],
            ['cle' => 'delai_traitement_defaut',  'valeur' => 7,      'type' => 'int',    'groupe' => 'courrier', 'description' => 'Délai de traitement par défaut (jours)'],
            ['cle' => 'confidentialite_defaut',   'valeur' => 'INTERNE', 'type' => 'string', 'groupe' => 'courrier', 'description' => 'Niveau de confidentialité par défaut'],

            ['cle' => 'ocr_actif',                'valeur' => true,   'type' => 'bool',   'groupe' => 'ocr',      'description' => 'Activer l\'OCR'],
            ['cle' => 'ocr_langue',               'valeur' => 'fra',  'type' => 'string', 'groupe' => 'ocr',      'description' => 'Langue OCR principale'],

            ['cle' => 'archive_duree_defaut',     'valeur' => 5,      'type' => 'int',    'groupe' => 'archives', 'description' => 'Durée de conservation par défaut (années)'],
        ];

        foreach ($parametres as $param) {
            ParametreGeneral::updateOrCreate(
                ['cle' => $param['cle']],
                [
                    'valeur' => is_bool($param['valeur']) ? ($param['valeur'] ? '1' : '0') : (string) $param['valeur'],
                    'type' => $param['type'],
                    'groupe' => $param['groupe'],
                    'description' => $param['description'],
                ]
            );
        }

        $this->command->info('✅ ' . count($parametres) . ' paramètres généraux créés.');
    }
}