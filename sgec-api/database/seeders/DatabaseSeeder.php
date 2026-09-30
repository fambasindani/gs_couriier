<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            DirectionSeeder::class,
            ParametreGeneralSeeder::class,

             // Module Courrier — Référentiels
            TypeCourrierSeeder::class,
            CategorieCourrierSeeder::class,
            PrioriteSeeder::class,
            StatutCourrierSeeder::class,
            ExpediteurSeeder::class,
            DestinataireSeeder::class,

               // Module Courrier — Table principale
             CourrierSeeder::class,

              // Module Courrier — Workflow
            CourrierAffectationSeeder::class,
            CourrierAnnotationSeeder::class,
            CourrierValidationSeeder::class,


            
            // Module Archivage
            ArchiveCategorySeeder::class,
            ArchiveEmplacementSeeder::class,
        ]);
    }
}