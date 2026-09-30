<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Utilisateurs
            ['nom' => 'Voir les utilisateurs',    'slug' => 'users.view',   'description' => 'Consulter la liste des utilisateurs'],
            ['nom' => 'Créer un utilisateur',     'slug' => 'users.create', 'description' => 'Ajouter un nouvel utilisateur'],
            ['nom' => 'Modifier un utilisateur',  'slug' => 'users.update', 'description' => 'Modifier un utilisateur existant'],
            ['nom' => 'Supprimer un utilisateur', 'slug' => 'users.delete', 'description' => 'Supprimer un utilisateur'],

            // Rôles
            ['nom' => 'Voir les rôles',    'slug' => 'roles.view',   'description' => 'Consulter la liste des rôles'],
            ['nom' => 'Créer un rôle',     'slug' => 'roles.create', 'description' => 'Ajouter un nouveau rôle'],
            ['nom' => 'Modifier un rôle',  'slug' => 'roles.update', 'description' => 'Modifier un rôle existant'],
            ['nom' => 'Supprimer un rôle', 'slug' => 'roles.delete', 'description' => 'Supprimer un rôle'],

            // Permissions
            ['nom' => 'Voir les permissions',     'slug' => 'permissions.view',   'description' => 'Consulter la liste des permissions'],
            ['nom' => 'Créer une permission',     'slug' => 'permissions.create', 'description' => 'Ajouter une nouvelle permission'],
            ['nom' => 'Modifier une permission',  'slug' => 'permissions.update', 'description' => 'Modifier une permission'],
            ['nom' => 'Supprimer une permission', 'slug' => 'permissions.delete', 'description' => 'Supprimer une permission'],

            // Structure
            ['nom' => 'Voir la structure',  'slug' => 'structure.view',   'description' => 'Consulter la structure organisationnelle'],
            ['nom' => 'Gérer la structure', 'slug' => 'structure.manage', 'description' => 'Créer/Modifier/Supprimer directions, départements, services'],

            // Courriers
            ['nom' => 'Voir les courriers',    'slug' => 'courriers.view',     'description' => 'Consulter les courriers'],
            ['nom' => 'Créer un courrier',     'slug' => 'courriers.create',   'description' => 'Enregistrer un nouveau courrier'],
            ['nom' => 'Modifier un courrier',  'slug' => 'courriers.update',   'description' => 'Modifier un courrier'],
            ['nom' => 'Supprimer un courrier', 'slug' => 'courriers.delete',   'description' => 'Supprimer un courrier'],
            ['nom' => 'Affecter un courrier',  'slug' => 'courriers.affecter', 'description' => 'Affecter un courrier à un service/utilisateur'],
            ['nom' => 'Annoter un courrier',   'slug' => 'courriers.annoter',  'description' => 'Ajouter des annotations à un courrier'],
            ['nom' => 'Valider un courrier',   'slug' => 'courriers.valider',  'description' => 'Viser ou valider un courrier'],

            // Audit
            ['nom' => "Voir le journal d'audit", 'slug' => 'audit.view', 'description' => "Consulter le journal d'audit"],
            ['nom' => "Purger le journal d'audit", 'slug' => 'audit.delete', 'description' => "Supprimer des entrées du journal d'audit"],

            // Paramètres
            ['nom' => 'Voir les paramètres',     'slug' => 'parametres.view',   'description' => 'Consulter les paramètres généraux'],
            ['nom' => 'Modifier les paramètres', 'slug' => 'parametres.update', 'description' => 'Modifier les paramètres généraux'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        $this->command->info('✅ ' . count($permissions) . ' permissions créées.');
    }
}