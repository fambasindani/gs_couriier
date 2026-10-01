-- --------------------------------------------------------
-- Hôte:                         127.0.0.1
-- Version du serveur:           8.0.30 - MySQL Community Server - GPL
-- SE du serveur:                Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Listage de la structure de la base pour gs_courrier
CREATE DATABASE IF NOT EXISTS `gs_courrier` /*!40100 DEFAULT CHARACTER SET armscii8 COLLATE armscii8_bin */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `gs_courrier`;

-- Listage de la structure de table gs_courrier. archives
CREATE TABLE IF NOT EXISTS `archives` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `courrier_id` bigint unsigned DEFAULT NULL,
  `archive_category_id` bigint unsigned DEFAULT NULL,
  `archive_emplacement_id` bigint unsigned DEFAULT NULL,
  `archive_par` bigint unsigned DEFAULT NULL,
  `cote_archive` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titre_dossier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `producteur_service` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_periode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duree_conservation_ans` int NOT NULL DEFAULT '5',
  `date_versement` date DEFAULT NULL,
  `date_fin_conservation` date DEFAULT NULL,
  `statut_archive` enum('ACTIF','VERSE','ELIMINE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIF',
  `observation` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `archives_cote_archive_unique` (`cote_archive`),
  KEY `archives_courrier_id_foreign` (`courrier_id`),
  KEY `archives_archive_category_id_foreign` (`archive_category_id`),
  KEY `archives_archive_emplacement_id_foreign` (`archive_emplacement_id`),
  KEY `archives_archive_par_foreign` (`archive_par`),
  KEY `archives_cote_archive_index` (`cote_archive`),
  KEY `archives_statut_archive_index` (`statut_archive`),
  CONSTRAINT `archives_archive_category_id_foreign` FOREIGN KEY (`archive_category_id`) REFERENCES `archive_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `archives_archive_emplacement_id_foreign` FOREIGN KEY (`archive_emplacement_id`) REFERENCES `archive_emplacements` (`id`) ON DELETE SET NULL,
  CONSTRAINT `archives_archive_par_foreign` FOREIGN KEY (`archive_par`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `archives_courrier_id_foreign` FOREIGN KEY (`courrier_id`) REFERENCES `courriers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.archives : ~4 rows (environ)
INSERT INTO `archives` (`id`, `courrier_id`, `archive_category_id`, `archive_emplacement_id`, `archive_par`, `cote_archive`, `titre_dossier`, `producteur_service`, `date_periode`, `duree_conservation_ans`, `date_versement`, `date_fin_conservation`, `statut_archive`, `observation`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 1, 1, 'ARCH-2026-0001', 'Dossier COUR-2026-0001 - Rapport trimestriel T3', 'Direction Générale', '2026-09', 10, '2026-09-30', '2036-09-30', 'ACTIF', 'Conservation obligatoire 10 ans selon réglementation', '2026-09-30 19:45:17', '2026-09-30 19:45:17'),
	(2, NULL, 4, 5, 1, 'ARCH-2026-0002', 'Dossier de carrière - Agent Mukendi Jean', 'Ressources Humaines', '2020-2026', 50, '2026-09-30', '2076-09-30', 'ACTIF', 'Dossier de carrière complet à conserver 50 ans', '2026-09-30 19:46:10', '2026-09-30 19:46:10'),
	(3, NULL, 2, 3, 1, 'ARCH-2026-0003', 'Factures fournisseurs - T3 2026', 'Direction Administrative et Financière', '2026-T3', 10, '2026-09-30', '2036-09-30', 'ACTIF', 'Factures et pièces justificatives', '2026-09-30 19:46:32', '2026-09-30 19:46:32'),
	(4, NULL, 2, 3, 1, 'ARCH-2026-0004', 'Factures fournisseurs - T3 2026', 'Direction Administrative et Financière', '2026-T3', 10, '2026-09-30', '2036-09-30', 'ACTIF', 'Factures et pièces justificatives', '2026-09-30 19:47:15', '2026-09-30 19:47:15'),
	(5, NULL, 6, 6, 1, 'ARCH-2026-0005', 'Dossier FONDEG - Approvisionnement stock central 2026', NULL, NULL, 5, '2026-09-30', '2031-09-30', 'ACTIF', 'Conservation courte durée', '2026-09-30 19:47:59', '2026-09-30 19:47:59'),
	(6, 6, 5, 1, 1, 'ARCH-2026-0006', 'Transmission du projet de budget 2027', 'SGEC', '2026-09-11', 5, '2026-09-21', '2031-09-21', 'ACTIF', NULL, '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(7, 7, 5, 1, 1, 'ARCH-2026-0007', 'Réponse à la demande de documentation juridique', 'SGEC', '2026-09-11', 5, '2026-09-21', '2031-09-21', 'ACTIF', NULL, '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(8, 11, NULL, NULL, 4, 'ARCH-2026-0008', 'Transmission du projet de budget 2027', 'Pierre Papy', '2026-09-28', 5, '2026-10-01', '2031-10-01', 'ACTIF', 'archiver pour  5 ans', '2026-10-01 08:37:21', '2026-10-01 08:37:21'),
	(9, 16, NULL, NULL, 1, 'ARCH-2026-0009', 'FINANCEMENT DU LOGICIEL', 'Pierre Papy', NULL, 5, '2026-10-01', '2031-10-01', 'ACTIF', 'ok', '2026-10-01 17:25:50', '2026-10-01 17:25:50');

-- Listage de la structure de table gs_courrier. archive_categories
CREATE TABLE IF NOT EXISTS `archive_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `archive_categories_libelle_unique` (`libelle`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.archive_categories : ~7 rows (environ)
INSERT INTO `archive_categories` (`id`, `libelle`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Courriers administratifs', 'Correspondance administrative générale', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 'Dossiers financiers', 'Factures, budgets, rapports financiers', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 'Dossiers juridiques', 'Contrats, actes juridiques', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(4, 'Ressources humaines', 'Dossiers du personnel', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(5, 'Correspondance officielle', 'Lettres officielles, notes de service', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(6, 'Documents techniques', 'Rapports, études, plans', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(7, 'Courriers confidentiels', 'Courriers à haute sensibilité nécessitant une conservation prolongée', '2026-09-30 19:42:40', '2026-09-30 19:42:40');

-- Listage de la structure de table gs_courrier. archive_emplacements
CREATE TABLE IF NOT EXISTS `archive_emplacements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `intitule` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `salle` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.archive_emplacements : ~6 rows (environ)
INSERT INTO `archive_emplacements` (`id`, `intitule`, `salle`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Rayon A - Étagère 1', 'Salle Archives 1', 'Courriers administratifs récents', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 'Rayon A - Étagère 2', 'Salle Archives 1', 'Courriers administratifs anciens', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 'Rayon B - Étagère 1', 'Salle Archives 1', 'Dossiers financiers', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(4, 'Rayon B - Étagère 2', 'Salle Archives 1', 'Dossiers juridiques', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(5, 'Rayon C - Étagère 1', 'Salle Archives 2', 'Ressources humaines', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(6, 'Rayon C - Étagère 2', 'Salle Archives 2', 'Documents techniques', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(7, 'Coffre-fort 1', 'Salle Sécurisée', 'Emplacement sécurisé pour courriers confidentiels', '2026-09-30 19:44:15', '2026-09-30 19:44:15');

-- Listage de la structure de table gs_courrier. audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `event` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_created_at_index` (`user_id`,`created_at`),
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.audit_logs : ~43 rows (environ)
INSERT INTO `audit_logs` (`id`, `user_id`, `event`, `url`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
	(1, 1, 'POST api/archive-categories', 'http://127.0.0.1:8000/api/archive-categories', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:42:40', '2026-09-30 19:42:40'),
	(2, 1, 'POST api/archive-emplacements', 'http://127.0.0.1:8000/api/archive-emplacements', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:44:15', '2026-09-30 19:44:15'),
	(3, 1, 'archive.creee', 'Archive ARCH-2026-0001 créée par Pierre Papy', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:45:17', '2026-09-30 19:45:17'),
	(4, 1, 'POST api/archives', 'http://127.0.0.1:8000/api/archives', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:45:17', '2026-09-30 19:45:17'),
	(5, 1, 'archive.creee', 'Archive ARCH-2026-0002 créée par Pierre Papy', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:46:10', '2026-09-30 19:46:10'),
	(6, 1, 'POST api/archives', 'http://127.0.0.1:8000/api/archives', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:46:11', '2026-09-30 19:46:11'),
	(7, 1, 'archive.creee', 'Archive ARCH-2026-0003 créée par Pierre Papy', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:46:32', '2026-09-30 19:46:32'),
	(8, 1, 'POST api/archives', 'http://127.0.0.1:8000/api/archives', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:46:32', '2026-09-30 19:46:32'),
	(9, 1, 'archive.creee', 'Archive ARCH-2026-0004 créée par Pierre Papy', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:47:15', '2026-09-30 19:47:15'),
	(10, 1, 'POST api/archives', 'http://127.0.0.1:8000/api/archives', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:47:15', '2026-09-30 19:47:15'),
	(11, 1, 'archive.creee', 'Archive ARCH-2026-0005 créée par Pierre Papy', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:47:59', '2026-09-30 19:47:59'),
	(12, 1, 'POST api/archives', 'http://127.0.0.1:8000/api/archives', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 19:47:59', '2026-09-30 19:47:59'),
	(13, 1, 'courrier.created', 'Courrier COUR-2026-0004 créé par Pierre Papy', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 20:07:29', '2026-09-30 20:07:29'),
	(14, 1, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 20:07:29', '2026-09-30 20:07:29'),
	(15, 1, 'POST api/courriers/4/lier', 'http://127.0.0.1:8000/api/courriers/4/lier', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 20:10:01', '2026-09-30 20:10:01'),
	(16, 1, 'courrier.lie', 'Courrier COUR-2026-0004 lié au courrier parent #1', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 20:11:29', '2026-09-30 20:11:29'),
	(17, 1, 'POST api/courriers/4/lier', 'http://127.0.0.1:8000/api/courriers/4/lier', '127.0.0.1', 'PostmanRuntime/7.51.1', '2026-09-30 20:11:29', '2026-09-30 20:11:29'),
	(18, 1, 'POST api/logout', 'http://127.0.0.1:8000/api/logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 20:55:55', '2026-09-30 20:55:55'),
	(19, 1, 'courrier.piece.ajoutee', 'Pièce \'aaa.pdf\' ajoutée au courrier COUR-2026-0003', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:08:49', '2026-09-30 21:08:49'),
	(20, 1, 'POST api/courrier-pieces', 'http://127.0.0.1:8000/api/courrier-pieces', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:08:50', '2026-09-30 21:08:50'),
	(21, 1, 'courrier.delie', 'Courrier COUR-2026-0004 délié de son parent', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:10:25', '2026-09-30 21:10:25'),
	(22, 1, 'DELETE api/courriers/4/delier', 'http://127.0.0.1:8000/api/courriers/4/delier', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:10:25', '2026-09-30 21:10:25'),
	(23, 1, 'courrier.affectation.maj', 'Affectation #3 mise à jour', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:15:26', '2026-09-30 21:15:26'),
	(24, 1, 'PUT api/courrier-affectations/3', 'http://127.0.0.1:8000/api/courrier-affectations/3', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:15:26', '2026-09-30 21:15:26'),
	(25, 1, 'POST api/type-courriers', 'http://127.0.0.1:8000/api/type-courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:27:42', '2026-09-30 21:27:42'),
	(26, 1, 'POST api/type-courriers', 'http://127.0.0.1:8000/api/type-courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:27:53', '2026-09-30 21:27:53'),
	(27, 1, 'DELETE api/type-courriers/4', 'http://127.0.0.1:8000/api/type-courriers/4', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:27:58', '2026-09-30 21:27:58'),
	(28, 1, 'POST api/categorie-courriers', 'http://127.0.0.1:8000/api/categorie-courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:28:11', '2026-09-30 21:28:11'),
	(29, 1, 'DELETE api/categorie-courriers/8', 'http://127.0.0.1:8000/api/categorie-courriers/8', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:28:19', '2026-09-30 21:28:19'),
	(30, 1, 'POST api/statut-courriers', 'http://127.0.0.1:8000/api/statut-courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:28:40', '2026-09-30 21:28:40'),
	(31, 1, 'POST api/statut-courriers', 'http://127.0.0.1:8000/api/statut-courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:28:47', '2026-09-30 21:28:47'),
	(32, 1, 'DELETE api/statut-courriers/9', 'http://127.0.0.1:8000/api/statut-courriers/9', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:28:53', '2026-09-30 21:28:53'),
	(33, 1, 'POST api/expediteurs', 'http://127.0.0.1:8000/api/expediteurs', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:29:14', '2026-09-30 21:29:14'),
	(34, 1, 'DELETE api/expediteurs/5', 'http://127.0.0.1:8000/api/expediteurs/5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:29:19', '2026-09-30 21:29:19'),
	(35, 1, 'POST api/destinataires', 'http://127.0.0.1:8000/api/destinataires', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:29:32', '2026-09-30 21:29:32'),
	(36, 1, 'DELETE api/destinataires/5', 'http://127.0.0.1:8000/api/destinataires/5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:29:38', '2026-09-30 21:29:38'),
	(37, 1, 'PUT api/roles/1', 'http://127.0.0.1:8000/api/roles/1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:41:29', '2026-09-30 21:41:29'),
	(38, 1, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:57:27', '2026-09-30 21:57:27'),
	(39, 1, 'POST api/directions', 'http://127.0.0.1:8000/api/directions', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-30 21:59:49', '2026-09-30 21:59:49'),
	(40, 1, 'POST api/services', 'http://127.0.0.1:8000/api/services', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:15:55', '2026-10-01 07:15:55'),
	(41, 1, 'POST api/services', 'http://127.0.0.1:8000/api/services', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:16:01', '2026-10-01 07:16:01'),
	(42, 1, 'courrier.updated', 'Courrier COUR-2026-0001 modifié par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:19:28', '2026-10-01 07:19:28'),
	(43, 1, 'PUT api/courriers/1', 'http://127.0.0.1:8000/api/courriers/1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:19:28', '2026-10-01 07:19:28'),
	(44, 1, 'courrier.valide', 'Courrier COUR-2026-0001 VALIDE par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:32:04', '2026-10-01 07:32:04'),
	(45, 1, 'POST api/courrier-validations', 'http://127.0.0.1:8000/api/courrier-validations', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:32:06', '2026-10-01 07:32:06'),
	(46, 1, 'POST api/users', 'http://127.0.0.1:8000/api/users', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:41:05', '2026-10-01 07:41:05'),
	(47, 1, 'POST api/logout', 'http://127.0.0.1:8000/api/logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:42:35', '2026-10-01 07:42:35'),
	(48, 4, 'courrier.created', 'Courrier COUR-2026-0005 créé par SALAMA NGOY', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:47:09', '2026-10-01 07:47:09'),
	(49, 4, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:47:09', '2026-10-01 07:47:09'),
	(50, 4, 'courrier.affectation.maj', 'Affectation #2 mise à jour', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:49:12', '2026-10-01 07:49:12'),
	(51, 4, 'PUT api/courrier-affectations/2', 'http://127.0.0.1:8000/api/courrier-affectations/2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:49:12', '2026-10-01 07:49:12'),
	(52, 4, 'POST api/logout', 'http://127.0.0.1:8000/api/logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 07:58:13', '2026-10-01 07:58:13'),
	(53, 1, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:01:22', '2026-10-01 08:01:22'),
	(54, 1, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:02:20', '2026-10-01 08:02:20'),
	(55, 1, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:02:46', '2026-10-01 08:02:46'),
	(56, 1, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:03:40', '2026-10-01 08:03:40'),
	(57, 1, 'POST api/courriers', 'http://localhost/api/courriers', '127.0.0.1', 'Symfony', '2026-10-01 08:04:18', '2026-10-01 08:04:18'),
	(58, 1, 'courrier.created', 'Courrier COUR-2026-9003 créé par Pierre Papy', '127.0.0.1', 'Symfony', '2026-10-01 08:04:33', '2026-10-01 08:04:33'),
	(59, 1, 'POST api/courriers', 'http://localhost/api/courriers', '127.0.0.1', 'Symfony', '2026-10-01 08:04:33', '2026-10-01 08:04:33'),
	(60, 1, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:04:45', '2026-10-01 08:04:45'),
	(61, 1, 'POST api/courriers', 'http://localhost/api/courriers', '127.0.0.1', 'Symfony', '2026-10-01 08:04:53', '2026-10-01 08:04:53'),
	(62, 1, 'courrier.created', 'Courrier COUR-2026-9004 créé par Pierre Papy', '127.0.0.1', 'Symfony', '2026-10-01 08:05:18', '2026-10-01 08:05:18'),
	(63, 1, 'POST api/courriers', 'http://localhost/api/courriers', '127.0.0.1', 'Symfony', '2026-10-01 08:05:18', '2026-10-01 08:05:18'),
	(64, 1, 'courrier.created', 'Courrier COUR-2026-9003 créé par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:05:52', '2026-10-01 08:05:52'),
	(65, 1, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:05:52', '2026-10-01 08:05:52'),
	(66, 1, 'courrier.piece.ajoutee', 'Pièce \'PV_inventaire_INV-202609-0003.pdf\' ajoutée au courrier COUR-2026-9003', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:07:33', '2026-10-01 08:07:33'),
	(67, 1, 'POST api/courrier-pieces', 'http://127.0.0.1:8000/api/courrier-pieces', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:07:34', '2026-10-01 08:07:34'),
	(68, 1, 'courrier.created', 'Courrier COUR-2026-9004 créé par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:10:49', '2026-10-01 08:10:49'),
	(69, 1, 'POST api/courriers', 'http://127.0.0.1:8000/api/courriers', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:10:49', '2026-10-01 08:10:49'),
	(70, 1, 'courrier.updated', 'Courrier COUR-2026-9004 modifié par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:11:28', '2026-10-01 08:11:28'),
	(71, 1, 'PUT api/courriers/12', 'http://127.0.0.1:8000/api/courriers/12', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:11:28', '2026-10-01 08:11:28'),
	(72, 1, 'courrier.piece.ajoutee', 'Pièce \'rapport-stock_2026-09-16.pdf\' ajoutée au courrier COUR-2026-9004', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:11:49', '2026-10-01 08:11:49'),
	(73, 1, 'POST api/courrier-pieces', 'http://127.0.0.1:8000/api/courrier-pieces', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:11:49', '2026-10-01 08:11:49'),
	(74, 1, 'courrier.affecte', 'Courrier COUR-2026-9003 affecté par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:21:24', '2026-10-01 08:21:24'),
	(75, 1, 'POST api/courrier-affectations', 'http://127.0.0.1:8000/api/courrier-affectations', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:21:24', '2026-10-01 08:21:24'),
	(76, 1, 'courrier.affecte', 'Courrier COUR-2026-0004 affecté par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:23:43', '2026-10-01 08:23:43'),
	(77, 1, 'POST api/courrier-affectations', 'http://127.0.0.1:8000/api/courrier-affectations', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:23:43', '2026-10-01 08:23:43'),
	(78, 1, 'POST api/logout', 'http://127.0.0.1:8000/api/logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:27:43', '2026-10-01 08:27:43'),
	(79, 4, 'courrier.affectation.maj', 'Affectation #6 mise à jour', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:28:22', '2026-10-01 08:28:22'),
	(80, 4, 'PUT api/courrier-affectations/6', 'http://127.0.0.1:8000/api/courrier-affectations/6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:28:22', '2026-10-01 08:28:22'),
	(81, 4, 'courrier.annote', 'Annotation ajoutée sur COUR-2026-9003 par SALAMA NGOY', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:30:39', '2026-10-01 08:30:39'),
	(82, 4, 'POST api/courrier-annotations', 'http://127.0.0.1:8000/api/courrier-annotations', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:30:39', '2026-10-01 08:30:39'),
	(83, 1, 'courrier.valide', 'Courrier COUR-2026-9003 VALIDE par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 08:36:17', '2026-10-01 08:36:17'),
	(84, 1, 'POST api/courrier-validations', 'http://127.0.0.1:8000/api/courrier-validations', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 08:36:17', '2026-10-01 08:36:17'),
	(85, 4, 'courrier.archive', 'Courrier COUR-2026-9003 archivé sous la cote ARCH-2026-0008', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:37:21', '2026-10-01 08:37:21'),
	(86, 4, 'POST api/courriers/11/archiver', 'http://127.0.0.1:8000/api/courriers/11/archiver', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 08:37:21', '2026-10-01 08:37:21'),
	(87, 1, 'courrier.lie', 'Courrier COUR-2026-9003 lié au courrier parent #6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 08:41:35', '2026-10-01 08:41:35'),
	(88, 1, 'POST api/courriers/11/lier', 'http://127.0.0.1:8000/api/courriers/11/lier', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 08:41:35', '2026-10-01 08:41:35'),
	(89, 1, 'courrier.piece.ajoutee', 'Pièce \'Facture_INV-2026-00001.pdf\' ajoutée au courrier COUR-2026-0005', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 08:51:29', '2026-10-01 08:51:29'),
	(90, 1, 'POST api/courrier-pieces', 'http://127.0.0.1:8000/api/courrier-pieces', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 08:51:29', '2026-10-01 08:51:29'),
	(95, 1, 'POST api/courriers/1/lettre', 'http://localhost/api/courriers/1/lettre', '127.0.0.1', 'Symfony', '2026-10-01 09:04:47', '2026-10-01 09:04:47'),
	(96, 1, 'POST api/logout', 'http://127.0.0.1:8000/api/logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 09:33:24', '2026-10-01 09:33:24'),
	(97, 1, 'PUT api/lettre-modeles/1', 'http://127.0.0.1:8000/api/lettre-modeles/1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 09:33:59', '2026-10-01 09:33:59'),
	(98, 4, 'POST api/courriers/11/lettre', 'http://127.0.0.1:8000/api/courriers/11/lettre', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 09:41:24', '2026-10-01 09:41:24'),
	(99, 1, 'POST api/courriers/1/lettre', 'http://127.0.0.1:8000/api/courriers/1/lettre', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 09:44:09', '2026-10-01 09:44:09'),
	(100, 4, 'POST api/courriers/11/lettre', 'http://127.0.0.1:8000/api/courriers/11/lettre', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 09:50:47', '2026-10-01 09:50:47'),
	(101, 1, 'POST api/courriers/1/lettre', 'http://127.0.0.1:8000/api/courriers/1/lettre', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:27:13', '2026-10-01 15:27:13'),
	(102, 1, 'POST api/courrier-pieces', 'http://127.0.0.1:8000/api/courrier-pieces', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:41:24', '2026-10-01 15:41:24'),
	(103, 1, 'courrier.piece.ajoutee', 'Pièce \'Accusé_de_réception_COUR-2026-9003.docx\' ajoutée au courrier COUR-2026-0001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:41:48', '2026-10-01 15:41:48'),
	(104, 1, 'POST api/courrier-pieces', 'http://127.0.0.1:8000/api/courrier-pieces', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:41:48', '2026-10-01 15:41:48'),
	(105, 1, 'courrier.piece.supprimee', 'Pièce \'Accusé_de_réception_COUR-2026-9003.docx\' supprimée du courrier COUR-2026-0001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:41:59', '2026-10-01 15:41:59'),
	(106, 1, 'DELETE api/courrier-pieces/5', 'http://127.0.0.1:8000/api/courrier-pieces/5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:41:59', '2026-10-01 15:41:59'),
	(119, 1, 'projet_lettre.cree', 'Projet PL-2026-0001 créé', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:47:44', '2026-10-01 15:47:44'),
	(120, 1, 'POST api/projets-lettres', 'http://127.0.0.1:8000/api/projets-lettres', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:47:44', '2026-10-01 15:47:44'),
	(121, 1, 'POST api/projets-lettres/2/generer-word', 'http://127.0.0.1:8000/api/projets-lettres/2/generer-word', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:48:01', '2026-10-01 15:48:01'),
	(122, 1, 'POST api/projets-lettres/2/generer-word', 'http://127.0.0.1:8000/api/projets-lettres/2/generer-word', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:48:07', '2026-10-01 15:48:07'),
	(123, 1, 'POST api/projets-lettres/2/importer', 'http://127.0.0.1:8000/api/projets-lettres/2/importer', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 15:48:26', '2026-10-01 15:48:26'),
	(124, 1, 'POST api/projets-lettres/2/generer-word', 'http://127.0.0.1:8000/api/projets-lettres/2/generer-word', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:03:41', '2026-10-01 16:03:41'),
	(125, 1, 'POST api/projets-lettres/2/soumettre', 'http://127.0.0.1:8000/api/projets-lettres/2/soumettre', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:05:15', '2026-10-01 16:05:15'),
	(126, 1, 'POST api/projets-lettres/2/decision', 'http://127.0.0.1:8000/api/projets-lettres/2/decision', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:05:32', '2026-10-01 16:05:32'),
	(127, 1, 'projet_lettre.signe', 'Projet PL-2026-0001 signé', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:05:46', '2026-10-01 16:05:46'),
	(128, 1, 'POST api/projets-lettres/2/signer', 'http://127.0.0.1:8000/api/projets-lettres/2/signer', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:05:46', '2026-10-01 16:05:46'),
	(129, 1, 'projet_lettre.courrier_sortant', 'Courrier sortant COUR-2026-9005 créé depuis PL-2026-0001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:06:03', '2026-10-01 16:06:03'),
	(130, 1, 'POST api/projets-lettres/2/courrier-sortant', 'http://127.0.0.1:8000/api/projets-lettres/2/courrier-sortant', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:06:03', '2026-10-01 16:06:03'),
	(131, 1, 'projet_lettre.supprime', 'Projet PL-2026-0001 supprimé', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:06:28', '2026-10-01 16:06:28'),
	(132, 1, 'DELETE api/projets-lettres/2', 'http://127.0.0.1:8000/api/projets-lettres/2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:06:28', '2026-10-01 16:06:28'),
	(133, 1, 'projet_lettre.cree', 'Projet PL-2026-0001 créé', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:12:03', '2026-10-01 16:12:03'),
	(134, 1, 'POST api/projets-lettres', 'http://127.0.0.1:8000/api/projets-lettres', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:12:04', '2026-10-01 16:12:04'),
	(135, 1, 'POST api/projets-lettres/3/importer', 'http://127.0.0.1:8000/api/projets-lettres/3/importer', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:24:06', '2026-10-01 16:24:06'),
	(136, 1, 'projet_lettre.version_supprimee', 'Version v1 du projet PL-2026-0001 supprimée', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:24:15', '2026-10-01 16:24:15'),
	(137, 1, 'DELETE api/projets-lettres/3/versions/6', 'http://127.0.0.1:8000/api/projets-lettres/3/versions/6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:24:15', '2026-10-01 16:24:15'),
	(138, 1, 'POST api/projets-lettres/3/importer', 'http://127.0.0.1:8000/api/projets-lettres/3/importer', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:42:04', '2026-10-01 16:42:04'),
	(139, 1, 'POST api/projets-lettres/3/soumettre', 'http://127.0.0.1:8000/api/projets-lettres/3/soumettre', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:43:57', '2026-10-01 16:43:57'),
	(140, 1, 'POST api/projets-lettres/3/decision', 'http://127.0.0.1:8000/api/projets-lettres/3/decision', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:44:24', '2026-10-01 16:44:24'),
	(141, 1, 'projet_lettre.signe', 'Projet PL-2026-0001 signé', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:44:55', '2026-10-01 16:44:55'),
	(142, 1, 'POST api/projets-lettres/3/signer', 'http://127.0.0.1:8000/api/projets-lettres/3/signer', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:44:55', '2026-10-01 16:44:55'),
	(143, 1, 'projet_lettre.courrier_sortant', 'Courrier sortant COUR-2026-9006 créé depuis PL-2026-0001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:50:17', '2026-10-01 16:50:17'),
	(144, 1, 'POST api/projets-lettres/3/courrier-sortant', 'http://127.0.0.1:8000/api/projets-lettres/3/courrier-sortant', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:50:17', '2026-10-01 16:50:17'),
	(145, 1, 'projet_lettre.supprime', 'Projet PL-2026-0001 supprimé', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:54:16', '2026-10-01 16:54:16'),
	(146, 1, 'DELETE api/projets-lettres/3', 'http://127.0.0.1:8000/api/projets-lettres/3', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:54:16', '2026-10-01 16:54:16'),
	(147, 1, 'projet_lettre.cree', 'Projet PL-2026-0001 créé', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:58:29', '2026-10-01 16:58:29'),
	(148, 1, 'POST api/projets-lettres', 'http://127.0.0.1:8000/api/projets-lettres', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:58:29', '2026-10-01 16:58:29'),
	(149, 1, 'POST api/projets-lettres/4/importer', 'http://127.0.0.1:8000/api/projets-lettres/4/importer', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 16:59:06', '2026-10-01 16:59:06'),
	(150, 4, 'POST api/projets-lettres/4/soumettre', 'http://127.0.0.1:8000/api/projets-lettres/4/soumettre', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-10-01 16:59:58', '2026-10-01 16:59:58'),
	(151, 1, 'POST api/projets-lettres/4/decision', 'http://127.0.0.1:8000/api/projets-lettres/4/decision', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:00:35', '2026-10-01 17:00:35'),
	(152, 1, 'projet_lettre.signe', 'Projet PL-2026-0001 signé', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:01:55', '2026-10-01 17:01:55'),
	(153, 1, 'POST api/projets-lettres/4/signer', 'http://127.0.0.1:8000/api/projets-lettres/4/signer', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:01:55', '2026-10-01 17:01:55'),
	(154, 1, 'projet_lettre.courrier_sortant', 'Courrier sortant COUR-2026-9007 créé depuis PL-2026-0001', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:02:26', '2026-10-01 17:02:26'),
	(155, 1, 'POST api/projets-lettres/4/courrier-sortant', 'http://127.0.0.1:8000/api/projets-lettres/4/courrier-sortant', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:02:27', '2026-10-01 17:02:27'),
	(156, 1, 'courrier.deleted', 'Courrier COUR-2026-9006 supprimé par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:03:46', '2026-10-01 17:03:46'),
	(157, 1, 'DELETE api/courriers/15', 'http://127.0.0.1:8000/api/courriers/15', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:03:46', '2026-10-01 17:03:46'),
	(158, 1, 'courrier.deleted', 'Courrier COUR-2026-9005 supprimé par Pierre Papy', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:03:57', '2026-10-01 17:03:57'),
	(159, 1, 'DELETE api/courriers/14', 'http://127.0.0.1:8000/api/courriers/14', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:03:57', '2026-10-01 17:03:57'),
	(160, 1, 'projet_lettre.expedie', 'Projet PL-2026-0001 expédié', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:05:02', '2026-10-01 17:05:02'),
	(161, 1, 'POST api/projets-lettres/4/expedier', 'http://127.0.0.1:8000/api/projets-lettres/4/expedier', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:05:03', '2026-10-01 17:05:03'),
	(162, 1, 'POST api/courriers/5/lettre', 'http://127.0.0.1:8000/api/courriers/5/lettre', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:22:11', '2026-10-01 17:22:11'),
	(163, 1, 'POST api/courriers/5/lettre', 'http://127.0.0.1:8000/api/courriers/5/lettre', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:22:55', '2026-10-01 17:22:55'),
	(164, 1, 'POST api/projets-lettres/4/archiver', 'http://127.0.0.1:8000/api/projets-lettres/4/archiver', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:24:46', '2026-10-01 17:24:46'),
	(165, 1, 'courrier.archive', 'Courrier COUR-2026-9007 archivé sous la cote ARCH-2026-0009', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:25:50', '2026-10-01 17:25:50'),
	(166, 1, 'POST api/courriers/16/archiver', 'http://127.0.0.1:8000/api/courriers/16/archiver', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0', '2026-10-01 17:25:50', '2026-10-01 17:25:50');

-- Listage de la structure de table gs_courrier. categorie_courriers
CREATE TABLE IF NOT EXISTS `categorie_courriers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categorie_courriers_libelle_unique` (`libelle`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.categorie_courriers : ~7 rows (environ)
INSERT INTO `categorie_courriers` (`id`, `libelle`, `created_at`, `updated_at`) VALUES
	(1, 'Administratif', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 'Financier', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 'Juridique', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(4, 'Technique', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(5, 'Commercial', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(6, 'Ressources humaines', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(7, 'Correspondance générale', '2026-09-30 19:41:20', '2026-09-30 19:41:20');

-- Listage de la structure de table gs_courrier. courriers
CREATE TABLE IF NOT EXISTS `courriers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `numero` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_externe` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_courrier_id` bigint unsigned NOT NULL,
  `categorie_id` bigint unsigned DEFAULT NULL,
  `priorite_id` bigint unsigned NOT NULL,
  `statut_id` bigint unsigned NOT NULL,
  `expediteur_id` bigint unsigned DEFAULT NULL,
  `destinataire_id` bigint unsigned DEFAULT NULL,
  `courrier_parent_id` bigint unsigned DEFAULT NULL,
  `objet` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenu` text COLLATE utf8mb4_unicode_ci,
  `date_courrier` date DEFAULT NULL,
  `date_reception` datetime DEFAULT NULL,
  `date_limite` datetime DEFAULT NULL,
  `date_cloture` datetime DEFAULT NULL,
  `confidentialite` enum('PUBLIC','INTERNE','CONFIDENTIEL','TRES_CONFIDENTIEL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INTERNE',
  `nombre_pieces` int NOT NULL DEFAULT '0',
  `nombre_pages` int NOT NULL DEFAULT '0',
  `observation` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint unsigned NOT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courriers_numero_unique` (`numero`),
  KEY `courriers_type_courrier_id_foreign` (`type_courrier_id`),
  KEY `courriers_categorie_id_foreign` (`categorie_id`),
  KEY `courriers_priorite_id_foreign` (`priorite_id`),
  KEY `courriers_expediteur_id_foreign` (`expediteur_id`),
  KEY `courriers_destinataire_id_foreign` (`destinataire_id`),
  KEY `courriers_courrier_parent_id_foreign` (`courrier_parent_id`),
  KEY `courriers_created_by_foreign` (`created_by`),
  KEY `courriers_updated_by_foreign` (`updated_by`),
  KEY `courriers_reference_externe_index` (`reference_externe`),
  KEY `courriers_date_reception_date_limite_index` (`date_reception`,`date_limite`),
  KEY `courriers_statut_id_index` (`statut_id`),
  KEY `courriers_confidentialite_index` (`confidentialite`),
  CONSTRAINT `courriers_categorie_id_foreign` FOREIGN KEY (`categorie_id`) REFERENCES `categorie_courriers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courriers_courrier_parent_id_foreign` FOREIGN KEY (`courrier_parent_id`) REFERENCES `courriers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courriers_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `courriers_destinataire_id_foreign` FOREIGN KEY (`destinataire_id`) REFERENCES `destinataires` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courriers_expediteur_id_foreign` FOREIGN KEY (`expediteur_id`) REFERENCES `expediteurs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courriers_priorite_id_foreign` FOREIGN KEY (`priorite_id`) REFERENCES `priorites` (`id`),
  CONSTRAINT `courriers_statut_id_foreign` FOREIGN KEY (`statut_id`) REFERENCES `statut_courriers` (`id`),
  CONSTRAINT `courriers_type_courrier_id_foreign` FOREIGN KEY (`type_courrier_id`) REFERENCES `type_courriers` (`id`),
  CONSTRAINT `courriers_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.courriers : ~4 rows (environ)
INSERT INTO `courriers` (`id`, `numero`, `reference_externe`, `type_courrier_id`, `categorie_id`, `priorite_id`, `statut_id`, `expediteur_id`, `destinataire_id`, `courrier_parent_id`, `objet`, `contenu`, `date_courrier`, `date_reception`, `date_limite`, `date_cloture`, `confidentialite`, `nombre_pieces`, `nombre_pages`, `observation`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
	(1, 'COUR-2026-0001', 'MIN/BUD/2026/045', 1, 2, 3, 5, 1, 1, NULL, 'Transmission du rapport trimestriel d\'exécution budgétaire', 'Veuillez trouver ci-joint le rapport trimestriel d\'exécution du budget pour le T3 2026.', '2026-09-28', '2026-09-28 23:41:00', '2026-10-05 23:41:00', NULL, 'INTERNE', 3, 45, NULL, 1, 1, '2026-09-30 19:41:20', '2026-10-01 15:41:59'),
	(2, 'COUR-2026-0002', 'DGRAD/2026/078', 1, 4, 2, 3, 2, 2, NULL, 'Note de service relative à la numérisation des dossiers', 'Dans le cadre de la modernisation, veuillez procéder à la numérisation des dossiers physiques.', '2026-09-27', '2026-09-27 21:41:20', '2026-10-10 21:41:20', NULL, 'CONFIDENTIEL', 1, 12, NULL, 1, NULL, '2026-09-30 19:41:20', '2026-10-01 07:49:12'),
	(3, 'COUR-2026-0003', 'FONDEG/2026/012', 1, 5, 1, 3, 3, 3, NULL, 'Demande d\'approvisionnement du stock central', 'Nous sollicitons un réapprovisionnement en fournitures de bureau.', '2026-09-26', '2026-09-26 21:41:20', '2026-10-15 21:41:20', NULL, 'PUBLIC', 3, 8, NULL, 1, NULL, '2026-09-30 19:41:20', '2026-09-30 21:15:26'),
	(4, 'COUR-2026-0004', NULL, 2, 1, 2, 2, 1, 1, NULL, 'Réponse au courrier COUR-2026-0001', NULL, NULL, '2026-09-30 22:07:29', NULL, NULL, 'INTERNE', 0, 0, NULL, 1, NULL, '2026-09-30 20:07:29', '2026-10-01 08:23:43'),
	(5, 'COUR-2026-0005', 'CONC/20026', 3, 2, 2, 2, 2, 1, NULL, 'DEMANDE DE FINANCEMENT D \'UN LOGICIEL', NULL, '2026-09-29', '2026-10-01 11:46:00', '2026-10-31 16:46:00', '2026-10-30 16:46:00', 'INTERNE', 1, 1, NULL, 4, NULL, '2026-10-01 07:47:09', '2026-10-01 08:51:29'),
	(6, 'COUR-2026-9001', 'MIN/BUD/2026/9001', 1, 2, 3, 8, 1, 1, NULL, 'Transmission du projet de budget 2027', 'Veuillez trouver ci-joint le projet de budget pour l’exercice 2027.', '2026-09-11', '2026-09-11 09:54:41', '2026-10-06 09:54:41', '2026-09-20 18:54:41', 'CONFIDENTIEL', 0, 3, NULL, 1, NULL, '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(7, 'COUR-2026-9002', 'SGEC/SORT/2026/9002', 2, 3, 2, 8, 2, 4, NULL, 'Réponse à la demande de documentation juridique', 'En réponse à votre demande, veuillez trouver les pièces sollicitées.', '2026-09-11', '2026-09-11 09:54:41', '2026-10-06 09:54:41', '2026-09-20 18:54:41', 'INTERNE', 0, 3, NULL, 1, NULL, '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(11, 'COUR-2026-9003', 'MIN/BUD/2027/001', 1, 2, 3, 8, 1, 1, 6, 'Transmission du projet de budget 2027', NULL, '2026-09-28', '2026-10-01 12:01:00', '2026-10-16 16:02:00', '2026-10-29 12:04:00', 'CONFIDENTIEL', 1, 0, NULL, 1, NULL, '2026-10-01 08:05:52', '2026-10-01 08:41:35'),
	(12, 'COUR-2026-9004', 'SGEC/SORT/2027/002', 2, 3, 2, 2, 2, 4, NULL, 'Réponse à la demande de documentation', NULL, '2026-09-28', '2026-10-01 15:10:00', '2026-10-15 15:11:00', '2026-10-30 15:11:00', 'INTERNE', 1, 0, NULL, 1, 1, '2026-10-01 08:10:49', '2026-10-01 08:11:49'),
	(16, 'COUR-2026-9007', 'PL-2026-0001', 2, NULL, 2, 8, NULL, NULL, NULL, 'FINANCEMENT DU LOGICIEL', 'Courrier sortant généré depuis le projet de lettre PL-2026-0001', NULL, '2026-10-01 19:02:26', NULL, NULL, 'INTERNE', 0, 0, NULL, 1, NULL, '2026-10-01 17:02:26', '2026-10-01 17:25:50');

-- Listage de la structure de table gs_courrier. courrier_affectations
CREATE TABLE IF NOT EXISTS `courrier_affectations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `courrier_id` bigint unsigned NOT NULL,
  `direction_id` bigint unsigned DEFAULT NULL,
  `departement_id` bigint unsigned DEFAULT NULL,
  `service_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `affecte_par` bigint unsigned NOT NULL,
  `date_affectation` datetime NOT NULL,
  `date_limite` datetime DEFAULT NULL,
  `date_prise_en_charge` datetime DEFAULT NULL,
  `date_traitement` datetime DEFAULT NULL,
  `statut` enum('AFFECTE','PRIS_EN_CHARGE','EN_TRAITEMENT','TRAITE','REJETE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AFFECTE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courrier_affectations_courrier_id_foreign` (`courrier_id`),
  KEY `courrier_affectations_direction_id_foreign` (`direction_id`),
  KEY `courrier_affectations_departement_id_foreign` (`departement_id`),
  KEY `courrier_affectations_service_id_foreign` (`service_id`),
  KEY `courrier_affectations_user_id_foreign` (`user_id`),
  KEY `courrier_affectations_affecte_par_foreign` (`affecte_par`),
  KEY `courrier_affectations_statut_index` (`statut`),
  KEY `courrier_affectations_date_limite_index` (`date_limite`),
  CONSTRAINT `courrier_affectations_affecte_par_foreign` FOREIGN KEY (`affecte_par`) REFERENCES `users` (`id`),
  CONSTRAINT `courrier_affectations_courrier_id_foreign` FOREIGN KEY (`courrier_id`) REFERENCES `courriers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courrier_affectations_departement_id_foreign` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courrier_affectations_direction_id_foreign` FOREIGN KEY (`direction_id`) REFERENCES `directions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courrier_affectations_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courrier_affectations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.courrier_affectations : ~3 rows (environ)
INSERT INTO `courrier_affectations` (`id`, `courrier_id`, `direction_id`, `departement_id`, `service_id`, `user_id`, `affecte_par`, `date_affectation`, `date_limite`, `date_prise_en_charge`, `date_traitement`, `statut`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 2, NULL, 2, 1, '2026-09-28 21:41:20', '2026-10-05 21:41:20', '2026-09-28 23:41:20', NULL, 'PRIS_EN_CHARGE', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 2, 1, 2, 1, 3, 2, '2026-09-27 21:41:20', '2026-10-07 21:41:00', '2026-09-27 22:41:20', NULL, 'EN_TRAITEMENT', '2026-09-30 19:41:20', '2026-10-01 07:49:12'),
	(3, 3, 2, 4, NULL, NULL, 1, '2026-09-29 21:41:20', '2026-10-15 21:41:20', '2026-09-30 23:15:26', NULL, 'PRIS_EN_CHARGE', '2026-09-30 19:41:20', '2026-09-30 21:15:26'),
	(4, 6, 2, 4, 7, 3, 1, '2026-09-12 18:54:41', '2026-10-05 09:54:41', '2026-09-13 18:54:41', '2026-09-19 18:54:41', 'TRAITE', '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(5, 7, 1, 2, 3, 3, 1, '2026-09-12 18:54:41', '2026-10-05 09:54:41', '2026-09-13 18:54:41', '2026-09-19 18:54:41', 'TRAITE', '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(6, 11, 2, 4, 6, 4, 1, '2026-10-01 10:21:24', '2026-10-24 16:21:00', '2026-10-01 10:28:22', NULL, 'PRIS_EN_CHARGE', '2026-10-01 08:21:24', '2026-10-01 08:28:22'),
	(7, 4, 3, 5, 8, 2, 1, '2026-10-01 10:23:43', '2026-10-30 12:23:00', NULL, NULL, 'AFFECTE', '2026-10-01 08:23:43', '2026-10-01 08:23:43');

-- Listage de la structure de table gs_courrier. courrier_annotations
CREATE TABLE IF NOT EXISTS `courrier_annotations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `courrier_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `annotation` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_limite` datetime DEFAULT NULL,
  `etat` enum('EN_ATTENTE','EN_COURS','EXECUTEE','ANNULEE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EN_ATTENTE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courrier_annotations_courrier_id_foreign` (`courrier_id`),
  KEY `courrier_annotations_user_id_foreign` (`user_id`),
  CONSTRAINT `courrier_annotations_courrier_id_foreign` FOREIGN KEY (`courrier_id`) REFERENCES `courriers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courrier_annotations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.courrier_annotations : ~3 rows (environ)
INSERT INTO `courrier_annotations` (`id`, `courrier_id`, `user_id`, `annotation`, `date_limite`, `etat`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'Merci de préparer une note de synthèse pour le DG avant vendredi.', '2026-10-03 21:41:20', 'EN_ATTENTE', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 1, 2, 'Analyse préliminaire effectuée, en attente de validation budgétaire.', '2026-10-05 21:41:20', 'EN_COURS', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 2, 1, 'Priorité haute : la numérisation doit démarrer ce mois-ci.', '2026-10-07 21:41:20', 'EN_ATTENTE', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(4, 6, 2, 'Préparer une note de synthèse pour le DG avant vendredi.', '2026-10-04 09:54:41', 'EN_ATTENTE', '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(5, 7, 2, 'Vérifier la conformité des pièces avant envoi.', '2026-10-04 09:54:41', 'EN_ATTENTE', '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(6, 11, 4, 'Préparer une note de synthèse', '2026-10-16 18:30:00', 'EN_COURS', '2026-10-01 08:30:39', '2026-10-01 08:30:39');

-- Listage de la structure de table gs_courrier. courrier_historiques
CREATE TABLE IF NOT EXISTS `courrier_historiques` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `courrier_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etape` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ancienne_valeur` json DEFAULT NULL,
  `nouvelle_valeur` json DEFAULT NULL,
  `adresse_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courrier_historiques_user_id_foreign` (`user_id`),
  KEY `courrier_historiques_courrier_id_index` (`courrier_id`),
  KEY `courrier_historiques_action_index` (`action`),
  KEY `courrier_historiques_created_at_index` (`created_at`),
  CONSTRAINT `courrier_historiques_courrier_id_foreign` FOREIGN KEY (`courrier_id`) REFERENCES `courriers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courrier_historiques_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.courrier_historiques : ~3 rows (environ)
INSERT INTO `courrier_historiques` (`id`, `courrier_id`, `user_id`, `action`, `etape`, `description`, `ancienne_valeur`, `nouvelle_valeur`, `adresse_ip`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'courrier.archive', 'Archivage', 'Courrier COUR-2026-0001 archivé sous la cote ARCH-2026-0001', NULL, '{"cote": "ARCH-2026-0001", "archive_id": 1}', '127.0.0.1', '2026-09-30 19:45:17', '2026-09-30 19:45:17'),
	(2, 4, 1, 'courrier.cree', 'Enregistrement', 'Courrier COUR-2026-0004 créé par Pierre Papy', NULL, '{"objet": "Réponse au courrier COUR-2026-0001", "numero": "COUR-2026-0004"}', '127.0.0.1', '2026-09-30 20:07:29', '2026-09-30 20:07:29'),
	(3, 3, 1, 'courrier.affectation.statut', 'Traitement', 'Affectation #3 passée au statut PRIS_EN_CHARGE', NULL, NULL, '127.0.0.1', '2026-09-30 21:15:26', '2026-09-30 21:15:26'),
	(4, 1, 1, 'courrier.modifie', 'Modification', 'Courrier COUR-2026-0001 modifié par Pierre Papy — Champs : date_reception, date_limite', '{"objet": "Transmission du rapport trimestriel d\'exécution budgétaire", "contenu": "Veuillez trouver ci-joint le rapport trimestriel d\'exécution du budget pour le T3 2026.", "statut_id": 8, "date_limite": "2026-10-05T21:41:20.000000Z", "observation": null, "priorite_id": 3, "categorie_id": 2, "date_cloture": null, "nombre_pages": 45, "date_courrier": "2026-09-28T00:00:00.000000Z", "expediteur_id": 1, "date_reception": "2026-09-28T21:41:20.000000Z", "confidentialite": "INTERNE", "destinataire_id": 1, "type_courrier_id": 1, "reference_externe": "MIN/BUD/2026/045"}', '{"date_limite": "2026-10-05T23:41:00.000000Z", "date_reception": "2026-09-28T23:41:00.000000Z"}', '127.0.0.1', '2026-10-01 07:19:28', '2026-10-01 07:19:28'),
	(5, 1, 1, 'courrier.valide', 'Validation', 'Courrier COUR-2026-0001 VALIDE par Pierre Papy', NULL, '{"decision": "VALIDE", "validation_id": 3}', '127.0.0.1', '2026-10-01 07:32:04', '2026-10-01 07:32:04'),
	(6, 5, 4, 'courrier.cree', 'Enregistrement', 'Courrier COUR-2026-0005 créé par SALAMA NGOY', NULL, '{"objet": "DEMANDE DE FINANCEMENT D \'UN LOGICIEL", "numero": "COUR-2026-0005"}', '127.0.0.1', '2026-10-01 07:47:09', '2026-10-01 07:47:09'),
	(7, 2, 4, 'courrier.affectation.statut', 'Traitement', 'Affectation #2 passée au statut EN_TRAITEMENT', NULL, NULL, '127.0.0.1', '2026-10-01 07:49:12', '2026-10-01 07:49:12'),
	(8, 6, 1, 'courrier.cree', 'Enregistrement', 'Courrier COUR-2026-9001 créé', NULL, NULL, '127.0.0.1', '2026-09-11 16:54:41', '2026-09-11 16:54:41'),
	(9, 6, 1, 'courrier.affecte', 'Affectation', 'Courrier COUR-2026-9001 affecté au service', NULL, NULL, '127.0.0.1', '2026-09-12 16:54:41', '2026-09-12 16:54:41'),
	(10, 6, 3, 'courrier.affectation.statut', 'Traitement', 'Affectation prise en charge par l’agent', NULL, NULL, '127.0.0.1', '2026-09-13 16:54:41', '2026-09-13 16:54:41'),
	(11, 6, 2, 'courrier.annote', 'Annotation', 'Préparer une note de synthèse pour le DG avant vendredi.', NULL, NULL, '127.0.0.1', '2026-09-14 16:54:41', '2026-09-14 16:54:41'),
	(12, 6, 3, 'courrier.affectation.statut', 'Traitement', 'Courrier en cours de traitement', NULL, NULL, '127.0.0.1', '2026-09-16 16:54:41', '2026-09-16 16:54:41'),
	(13, 6, 2, 'courrier.valide', 'Validation', 'Courrier validé : Validé pour transmission au Conseil des ministres.', NULL, NULL, '127.0.0.1', '2026-09-18 16:54:41', '2026-09-18 16:54:41'),
	(14, 6, 3, 'courrier.affectation.statut', 'Traitement', 'Traitement terminé', NULL, NULL, '127.0.0.1', '2026-09-19 16:54:41', '2026-09-19 16:54:41'),
	(15, 6, 2, 'courrier.cloture', 'Clôture', 'Courrier clôturé', NULL, NULL, '127.0.0.1', '2026-09-20 16:54:41', '2026-09-20 16:54:41'),
	(16, 6, 1, 'courrier.archive', 'Archivage', 'Courrier archivé sous la cote ARCH-2026-0006', NULL, NULL, '127.0.0.1', '2026-09-21 16:54:41', '2026-09-21 16:54:41'),
	(17, 7, 1, 'courrier.cree', 'Enregistrement', 'Courrier COUR-2026-9002 créé', NULL, NULL, '127.0.0.1', '2026-09-11 16:54:41', '2026-09-11 16:54:41'),
	(18, 7, 1, 'courrier.affecte', 'Affectation', 'Courrier COUR-2026-9002 affecté au service', NULL, NULL, '127.0.0.1', '2026-09-12 16:54:41', '2026-09-12 16:54:41'),
	(19, 7, 3, 'courrier.affectation.statut', 'Traitement', 'Affectation prise en charge par l’agent', NULL, NULL, '127.0.0.1', '2026-09-13 16:54:41', '2026-09-13 16:54:41'),
	(20, 7, 2, 'courrier.annote', 'Annotation', 'Vérifier la conformité des pièces avant envoi.', NULL, NULL, '127.0.0.1', '2026-09-14 16:54:41', '2026-09-14 16:54:41'),
	(21, 7, 3, 'courrier.affectation.statut', 'Traitement', 'Courrier en cours de traitement', NULL, NULL, '127.0.0.1', '2026-09-16 16:54:41', '2026-09-16 16:54:41'),
	(22, 7, 2, 'courrier.valide', 'Validation', 'Courrier validé : Visa accordé, prêt pour expédition.', NULL, NULL, '127.0.0.1', '2026-09-18 16:54:41', '2026-09-18 16:54:41'),
	(23, 7, 3, 'courrier.affectation.statut', 'Traitement', 'Traitement terminé', NULL, NULL, '127.0.0.1', '2026-09-19 16:54:41', '2026-09-19 16:54:41'),
	(24, 7, 2, 'courrier.cloture', 'Clôture', 'Courrier clôturé', NULL, NULL, '127.0.0.1', '2026-09-20 16:54:41', '2026-09-20 16:54:41'),
	(25, 7, 1, 'courrier.archive', 'Archivage', 'Courrier archivé sous la cote ARCH-2026-0007', NULL, NULL, '127.0.0.1', '2026-09-21 16:54:41', '2026-09-21 16:54:41'),
	(29, 11, 1, 'courrier.cree', 'Enregistrement', 'Courrier COUR-2026-9003 créé par Pierre Papy', NULL, '{"objet": "Transmission du projet de budget 2027", "numero": "COUR-2026-9003"}', '127.0.0.1', '2026-10-01 08:05:52', '2026-10-01 08:05:52'),
	(30, 12, 1, 'courrier.cree', 'Enregistrement', 'Courrier COUR-2026-9004 créé par Pierre Papy', NULL, '{"objet": "Réponse à la demande de documentation", "numero": "COUR-2026-9004"}', '127.0.0.1', '2026-10-01 08:10:49', '2026-10-01 08:10:49'),
	(31, 12, 1, 'courrier.modifie', 'Modification', 'Courrier COUR-2026-9004 modifié par Pierre Papy — Champs : date_reception, date_limite, date_cloture', '{"objet": "Réponse à la demande de documentation", "contenu": null, "statut_id": 2, "date_limite": null, "observation": null, "priorite_id": 2, "categorie_id": 3, "date_cloture": null, "nombre_pages": 0, "date_courrier": "2026-09-28T00:00:00.000000Z", "expediteur_id": 2, "date_reception": "2026-10-01T13:10:00.000000Z", "confidentialite": "INTERNE", "destinataire_id": 4, "type_courrier_id": 2, "reference_externe": "SGEC/SORT/2027/002"}', '{"date_limite": "2026-10-15T15:11:00.000000Z", "date_cloture": "2026-10-30T15:11:00.000000Z", "date_reception": "2026-10-01T15:10:00.000000Z"}', '127.0.0.1', '2026-10-01 08:11:28', '2026-10-01 08:11:28'),
	(32, 11, 1, 'courrier.affecte', 'Affectation', 'Courrier COUR-2026-9003 affecté par Pierre Papy', NULL, '{"affectation_id": 6}', '127.0.0.1', '2026-10-01 08:21:24', '2026-10-01 08:21:24'),
	(33, 4, 1, 'courrier.affecte', 'Affectation', 'Courrier COUR-2026-0004 affecté par Pierre Papy', NULL, '{"affectation_id": 7}', '127.0.0.1', '2026-10-01 08:23:43', '2026-10-01 08:23:43'),
	(34, 11, 4, 'courrier.affectation.statut', 'Traitement', 'Affectation #6 passée au statut PRIS_EN_CHARGE', NULL, NULL, '127.0.0.1', '2026-10-01 08:28:22', '2026-10-01 08:28:22'),
	(35, 11, 4, 'courrier.annote', 'Annotation', 'Annotation ajoutée sur COUR-2026-9003 par SALAMA NGOY', NULL, '{"annotation_id": 6}', '127.0.0.1', '2026-10-01 08:30:39', '2026-10-01 08:30:39'),
	(36, 11, 1, 'courrier.valide', 'Validation', 'Courrier COUR-2026-9003 VALIDE par Pierre Papy', NULL, '{"decision": "VALIDE", "validation_id": 6}', '127.0.0.1', '2026-10-01 08:36:17', '2026-10-01 08:36:17'),
	(37, 11, 4, 'courrier.archive', 'Archivage', 'Courrier archivé sous la cote ARCH-2026-0008 par SALAMA NGOY', NULL, '{"cote": "ARCH-2026-0008", "archive_id": 8}', '127.0.0.1', '2026-10-01 08:37:21', '2026-10-01 08:37:21'),
	(39, 16, 1, 'courrier.archive', 'Archivage', 'Courrier archivé sous la cote ARCH-2026-0009 par Pierre Papy', NULL, '{"cote": "ARCH-2026-0009", "archive_id": 9}', '127.0.0.1', '2026-10-01 17:25:50', '2026-10-01 17:25:50');

-- Listage de la structure de table gs_courrier. courrier_pieces
CREATE TABLE IF NOT EXISTS `courrier_pieces` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `courrier_id` bigint unsigned NOT NULL,
  `nom_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom_fichier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chemin` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `extension` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `taille` bigint unsigned DEFAULT NULL,
  `texte_ocr` longtext COLLATE utf8mb4_unicode_ci,
  `date_ocr` timestamp NULL DEFAULT NULL,
  `est_principal` tinyint(1) NOT NULL DEFAULT '0',
  `uploaded_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courrier_pieces_uploaded_by_foreign` (`uploaded_by`),
  KEY `courrier_pieces_courrier_id_index` (`courrier_id`),
  KEY `courrier_pieces_est_principal_index` (`est_principal`),
  CONSTRAINT `courrier_pieces_courrier_id_foreign` FOREIGN KEY (`courrier_id`) REFERENCES `courriers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courrier_pieces_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.courrier_pieces : ~1 rows (environ)
INSERT INTO `courrier_pieces` (`id`, `courrier_id`, `nom_original`, `nom_fichier`, `chemin`, `extension`, `mime_type`, `taille`, `texte_ocr`, `date_ocr`, `est_principal`, `uploaded_by`, `created_at`, `updated_at`) VALUES
	(1, 3, 'aaa.pdf', 'courrier_3_1790809728.pdf', 'courriers/3/courrier_3_1790809728.pdf', 'pdf', 'application/pdf', 174728, NULL, NULL, 0, 1, '2026-09-30 21:08:49', '2026-09-30 21:08:49'),
	(2, 11, 'PV_inventaire_INV-202609-0003.pdf', 'courrier_11_1790849252.pdf', 'courriers/11/courrier_11_1790849252.pdf', 'pdf', 'application/pdf', 10520, NULL, NULL, 0, 1, '2026-10-01 08:07:33', '2026-10-01 08:07:33'),
	(3, 12, 'rapport-stock_2026-09-16.pdf', 'courrier_12_1790849509.pdf', 'courriers/12/courrier_12_1790849509.pdf', 'pdf', 'application/pdf', 5561, NULL, NULL, 0, 1, '2026-10-01 08:11:49', '2026-10-01 08:11:49'),
	(4, 5, 'Facture_INV-2026-00001.pdf', 'courrier_5_1790851889.pdf', 'courriers/5/courrier_5_1790851889.pdf', 'pdf', 'application/pdf', 4039, NULL, NULL, 0, 1, '2026-10-01 08:51:29', '2026-10-01 08:51:29');

-- Listage de la structure de table gs_courrier. courrier_validations
CREATE TABLE IF NOT EXISTS `courrier_validations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `courrier_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `decision` enum('VISE','VALIDE','REJETE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VALIDE',
  `commentaire` text COLLATE utf8mb4_unicode_ci,
  `date_validation` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courrier_validations_courrier_id_foreign` (`courrier_id`),
  KEY `courrier_validations_user_id_foreign` (`user_id`),
  CONSTRAINT `courrier_validations_courrier_id_foreign` FOREIGN KEY (`courrier_id`) REFERENCES `courriers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courrier_validations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.courrier_validations : ~2 rows (environ)
INSERT INTO `courrier_validations` (`id`, `courrier_id`, `user_id`, `decision`, `commentaire`, `date_validation`, `created_at`, `updated_at`) VALUES
	(1, 1, 2, 'VISE', 'Vu et transmis au DG pour validation finale.', '2026-09-29 21:41:20', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 2, 1, 'VALIDE', 'Validé pour mise en œuvre immédiate.', '2026-09-30 09:41:20', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 1, 1, 'VALIDE', NULL, '2026-10-01 09:32:04', '2026-10-01 07:32:04', '2026-10-01 07:32:04'),
	(4, 6, 2, 'VALIDE', 'Validé pour transmission au Conseil des ministres.', '2026-09-18 18:54:41', '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(5, 7, 2, 'VALIDE', 'Visa accordé, prêt pour expédition.', '2026-09-18 18:54:41', '2026-10-01 07:54:41', '2026-10-01 07:54:41'),
	(6, 11, 1, 'VALIDE', 'tout est ok', '2026-10-01 10:36:17', '2026-10-01 08:36:17', '2026-10-01 08:36:17');

-- Listage de la structure de table gs_courrier. departements
CREATE TABLE IF NOT EXISTS `departements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `direction_id` bigint unsigned NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `departements_direction_id_code_unique` (`direction_id`,`code`),
  CONSTRAINT `departements_direction_id_foreign` FOREIGN KEY (`direction_id`) REFERENCES `directions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.departements : ~5 rows (environ)
INSERT INTO `departements` (`id`, `direction_id`, `code`, `libelle`, `description`, `created_at`, `updated_at`) VALUES
	(1, 1, 'DG-SEC', 'Secrétariat Général', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(2, 1, 'DG-DANTIC', 'Direction des Affaires Numériques et TIC', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(3, 2, 'DAF-RH', 'Ressources Humaines', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(4, 2, 'DAF-FIN', 'Finances', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(5, 3, 'DT-EXP', 'Exploitation', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19');

-- Listage de la structure de table gs_courrier. destinataires
CREATE TABLE IF NOT EXISTS `destinataires` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_destinataire` enum('INTERNE','EXTERNE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EXTERNE',
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `telephone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.destinataires : ~4 rows (environ)
INSERT INTO `destinataires` (`id`, `nom`, `type_destinataire`, `adresse`, `telephone`, `email`, `created_at`, `updated_at`) VALUES
	(1, 'Direction Générale', 'INTERNE', 'Siège social', '+243 800 100 001', 'dg@sgec.cd', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 'Direction DANTIC', 'INTERNE', 'Siège social', '+243 800 100 002', 'dantic@sgec.cd', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 'Direction Administrative et Financière', 'INTERNE', 'Siège social', '+243 800 100 003', 'daf@sgec.cd', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(4, 'Ministère de la Justice', 'EXTERNE', 'Kinshasa, Gombe', '+243 800 200 001', 'contact@justice.gouv.cd', '2026-09-30 19:41:20', '2026-09-30 19:41:20');

-- Listage de la structure de table gs_courrier. directions
CREATE TABLE IF NOT EXISTS `directions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `directions_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.directions : ~3 rows (environ)
INSERT INTO `directions` (`id`, `code`, `libelle`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'DG', 'Direction Générale', 'Direction Générale de l\'entreprise', '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(2, 'DAF', 'Direction Administrative et Financière', 'Gestion administrative et financière', '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(3, 'DT', 'Direction Technique', 'Direction technique et opérationnelle', '2026-09-30 19:41:19', '2026-09-30 19:41:19');

-- Listage de la structure de table gs_courrier. expediteurs
CREATE TABLE IF NOT EXISTS `expediteurs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_personne` enum('PHYSIQUE','MORALE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MORALE',
  `adresse` text COLLATE utf8mb4_unicode_ci,
  `telephone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.expediteurs : ~4 rows (environ)
INSERT INTO `expediteurs` (`id`, `nom`, `type_personne`, `adresse`, `telephone`, `email`, `created_at`, `updated_at`) VALUES
	(1, 'Ministère du Budget', 'MORALE', 'Kinshasa, Gombe', '+243 800 000 001', 'contact@budget.gouv.cd', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 'Direction Générale DGRAD', 'MORALE', 'Kinshasa, Gombe', '+243 800 000 002', 'contact@dgrad.cd', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 'Fondeg Catering Congo S.A.', 'MORALE', 'Kinshasa, Limete', '+243 800 000 003', 'info@fondeg.cd', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(4, 'Jean Mukendi', 'PHYSIQUE', 'Kinshasa, Lingwala', '+243 810 000 004', 'jean.mukendi@example.cd', '2026-09-30 19:41:20', '2026-09-30 19:41:20');

-- Listage de la structure de table gs_courrier. failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.failed_jobs : ~0 rows (environ)

-- Listage de la structure de table gs_courrier. historique_projets_lettres
CREATE TABLE IF NOT EXISTS `historique_projets_lettres` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `projet_lettre_id` bigint unsigned NOT NULL,
  `utilisateur_id` bigint unsigned DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ancien_statut` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nouveau_statut` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `commentaire` text COLLATE utf8mb4_unicode_ci,
  `date_action` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `historique_projets_lettres_utilisateur_id_foreign` (`utilisateur_id`),
  KEY `historique_projets_lettres_projet_lettre_id_index` (`projet_lettre_id`),
  CONSTRAINT `historique_projets_lettres_projet_lettre_id_foreign` FOREIGN KEY (`projet_lettre_id`) REFERENCES `projets_lettres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historique_projets_lettres_utilisateur_id_foreign` FOREIGN KEY (`utilisateur_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.historique_projets_lettres : ~7 rows (environ)
INSERT INTO `historique_projets_lettres` (`id`, `projet_lettre_id`, `utilisateur_id`, `action`, `ancien_statut`, `nouveau_statut`, `commentaire`, `date_action`, `created_at`, `updated_at`) VALUES
	(26, 4, 1, 'creation', 'BROUILLON', 'BROUILLON', 'Création du projet de lettre', '2026-10-01 16:58:29', '2026-10-01 16:58:29', '2026-10-01 16:58:29'),
	(27, 4, 1, 'import_version', 'BROUILLON', 'EN_REDACTION', 'Version v1 importée', '2026-10-01 16:59:06', '2026-10-01 16:59:06', '2026-10-01 16:59:06'),
	(28, 4, 4, 'soumission', 'EN_REDACTION', 'SOUMIS_A_VALIDATION', NULL, '2026-10-01 16:59:58', '2026-10-01 16:59:58', '2026-10-01 16:59:58'),
	(29, 4, 1, 'decision_approuve', 'SOUMIS_A_VALIDATION', 'A_SIGNER', NULL, '2026-10-01 17:00:34', '2026-10-01 17:00:34', '2026-10-01 17:00:34'),
	(30, 4, 1, 'signature', 'SIGNE', 'SIGNE', NULL, '2026-10-01 17:01:55', '2026-10-01 17:01:55', '2026-10-01 17:01:55'),
	(31, 4, 1, 'courrier_sortant_cree', 'A_EXPEDIER', 'A_EXPEDIER', 'Courrier sortant COUR-2026-9007 créé', '2026-10-01 17:02:26', '2026-10-01 17:02:26', '2026-10-01 17:02:26'),
	(32, 4, 1, 'expedition', 'EXPEDIE', 'EXPEDIE', 'poste', '2026-10-01 17:05:02', '2026-10-01 17:05:02', '2026-10-01 17:05:02'),
	(33, 4, 1, 'archivage', 'EXPEDIE', 'ARCHIVE', NULL, '2026-10-01 17:24:46', '2026-10-01 17:24:46', '2026-10-01 17:24:46');

-- Listage de la structure de table gs_courrier. lettre_modeles
CREATE TABLE IF NOT EXISTS `lettre_modeles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `objet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `corps` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_courrier_id` bigint unsigned DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lettre_modeles_type_courrier_id_foreign` (`type_courrier_id`),
  KEY `lettre_modeles_created_by_foreign` (`created_by`),
  KEY `lettre_modeles_actif_index` (`actif`),
  CONSTRAINT `lettre_modeles_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lettre_modeles_type_courrier_id_foreign` FOREIGN KEY (`type_courrier_id`) REFERENCES `type_courriers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.lettre_modeles : ~7 rows (environ)
INSERT INTO `lettre_modeles` (`id`, `nom`, `objet`, `corps`, `type_courrier_id`, `actif`, `created_by`, `created_at`, `updated_at`) VALUES
	(1, 'Accusé de réception', 'Accusé de réception — {{numero}}', 'Kinshasa, le {{date_du_jour}}\n\nObjet : Accusé de réception — {{numero}}\n\nÀ l\'attention de {{expediteur}},\n\nNous accusons réception de votre correspondance référencée « {{reference_externe}} » du {{date_courrier}}, ayant pour objet : {{objet}}.\n\nVotre courrier a été enregistré sous le numéro {{numero}} (catégorie : {{categorie}}, priorité : {{priorite}}) et transmis au service compétent pour traitement.\n\nVeuillez agréer, {{expediteur}}, l\'expression de nos salutations distinguées.\n\nLe Secrétariat Général\nSGEC', 1, 1, NULL, '2026-10-01 09:03:16', '2026-10-01 09:03:16'),
	(2, 'Demande de complément', 'Demande de complément — {{objet}}', 'Kinshasa, le {{date_du_jour}}\n\nObjet : Demande de complément — {{objet}}\n\nÀ l\'attention de {{expediteur}},\n\nDans le cadre du traitement du dossier « {{objet}} » (référence {{numero}}), nous vous prions de bien vouloir nous transmettre les pièces complémentaires suivantes :\n- ....................................................\n- ....................................................\n\nDate limite de réponse suggérée : {{date_limite}}.\n\nNous vous remercions par avance de votre collaboration.\n\nSGEC', NULL, 1, NULL, '2026-10-01 09:03:16', '2026-10-01 09:03:16'),
	(3, 'Note de transmission', 'Note de transmission — {{objet}}', 'Kinshasa, le {{date_du_jour}}\n\nNote de transmission\n\nRéférence : {{numero}}\nObjet : {{objet}}\nÀ : {{destinataire}}\n\nPour traitement et suivi, veuillez trouver ci-joint le courrier référencé « {{reference_externe}} » reçu le {{date_reception}}.\n\nLe délai de traitement souhaité est fixé au {{date_limite}}.\n\nLe Secrétariat Général\nSGEC', 3, 1, NULL, '2026-10-01 09:36:43', '2026-10-01 09:36:43'),
	(4, 'Demande d\'information', 'Demande d\'information — {{numero}}', 'Kinshasa, le {{date_du_jour}}\n\nObjet : Demande d\'information\n\nÀ l\'attention de {{destinataire}},\n\nNous vous prions de bien vouloir nous communiquer les informations suivantes concernant :\n{{objet}}\n\n1. ....................................................\n2. ....................................................\n3. ....................................................\n\nNous vous saurions gré de bien vouloir nous répondre au plus tard le {{date_limite}}.\n\nVeuillez agréer, {{destinataire}}, l\'expression de nos salutations distinguées.\n\nSGEC', 2, 1, NULL, '2026-10-01 09:36:43', '2026-10-01 09:36:43'),
	(5, 'Réponse à une demande', 'Réponse — {{objet}}', 'Kinshasa, le {{date_du_jour}}\n\nObjet : Réponse à votre correspondance du {{date_courrier}}\nVotre référence : {{reference_externe}}\n\nÀ l\'attention de {{expediteur}},\n\nEn réponse à votre courrier visé en objet, nous avons l\'honneur de vous informer ce qui suit :\n\n....................................................................\n....................................................................\n\nNous restons à votre disposition pour tout renseignement complémentaire.\n\nVeuillez agréer, {{expediteur}}, l\'expression de nos salutations distinguées.\n\nSGEC', 2, 1, NULL, '2026-10-01 09:36:43', '2026-10-01 09:36:43'),
	(6, 'Relance — dossier en retard', 'Relance — {{objet}}', 'Kinshasa, le {{date_du_jour}}\n\nObjet : Relance — traitement du dossier « {{objet}} »\n\nÀ l\'attention de {{destinataire}},\n\nNous nous permettons d\'attirer votre attention sur le dossier référencé « {{numero}} », dont le délai de traitement était fixé au {{date_limite}}.\n\nÀ ce jour, nous n\'avons pas encore enregistré sa clôture. Nous vous prions de bien vouloir procéder au traitement ou de nous indiquer les raisons du retard.\n\nNous vous remercions de votre diligence.\n\nSGEC', NULL, 1, NULL, '2026-10-01 09:36:43', '2026-10-01 09:36:43'),
	(7, 'Invitation / Convocation', 'Convocation — {{objet}}', 'Kinshasa, le {{date_du_jour}}\n\nObjet : Convocation — {{objet}}\n\nÀ l\'attention de {{destinataire}},\n\nVous êtes invité(e) à prendre part à une réunion portant sur le dossier « {{numero}} » :\n\n• Date : ...................................\n• Heure : ...................................\n• Lieu : ...................................\n\nVotre présence est vivement souhaitée. En cas d\'empêchement, veuillez désigner un représentant.\n\nSGEC', 3, 1, NULL, '2026-10-01 09:36:43', '2026-10-01 09:36:43');

-- Listage de la structure de table gs_courrier. migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.migrations : ~0 rows (environ)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '2014_10_12_000000_create_users_table', 1),
	(2, '2019_08_19_000000_create_failed_jobs_table', 1),
	(3, '2019_12_14_000001_create_personal_access_tokens_table', 1),
	(4, '2026_09_30_093449_create_permissions_table', 1),
	(5, '2026_09_30_093449_create_roles_table', 1),
	(6, '2026_09_30_093450_create_role_permissions_table', 1),
	(7, '2026_09_30_093450_create_user_roles_table', 1),
	(8, '2026_09_30_093451_create_directions_table', 1),
	(9, '2026_09_30_093453_create_departements_table', 1),
	(10, '2026_09_30_093454_create_services_table', 1),
	(11, '2026_09_30_093455_create_audit_logs_table', 1),
	(12, '2026_09_30_093456_create_parametre_generals_table', 1),
	(13, '2026_09_30_111337_create_categorie_courriers_table', 1),
	(14, '2026_09_30_111337_create_type_courriers_table', 1),
	(15, '2026_09_30_111338_create_priorites_table', 1),
	(16, '2026_09_30_113633_create_statut_courriers_table', 1),
	(17, '2026_09_30_113634_create_destinataires_table', 1),
	(18, '2026_09_30_113634_create_expediteurs_table', 1),
	(19, '2026_09_30_115119_create_courriers_table', 1),
	(20, '2026_09_30_125529_create_courrier_affectations_table', 1),
	(21, '2026_09_30_125529_create_courrier_annotations_table', 1),
	(22, '2026_09_30_125529_create_courrier_validations_table', 1),
	(23, '2026_09_30_131926_create_courrier_pieces_table', 1),
	(24, '2026_09_30_133223_create_courrier_historiques_table', 1),
	(25, '2026_09_30_140726_create_archive_categories_table', 1),
	(26, '2026_09_30_140726_create_archive_emplacements_table', 1),
	(27, '2026_09_30_140730_create_archives_table', 1),
	(28, '2026_10_01_000000_add_structure_to_users_table', 2),
	(29, '2026_10_02_000000_create_lettre_modeles_table', 3),
	(30, '2026_10_03_000001_create_projets_lettres_table', 4),
	(31, '2026_10_03_000002_create_versions_projets_lettres_table', 4),
	(32, '2026_10_03_000003_create_validations_projets_lettres_table', 4),
	(33, '2026_10_03_000004_create_historique_projets_lettres_table', 4);

-- Listage de la structure de table gs_courrier. parametres_generaux
CREATE TABLE IF NOT EXISTS `parametres_generaux` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valeur` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `groupe` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `parametres_generaux_cle_unique` (`cle`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.parametres_generaux : ~13 rows (environ)
INSERT INTO `parametres_generaux` (`id`, `cle`, `valeur`, `type`, `groupe`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'app_nom', 'SGEC', 'string', 'general', 'Nom de l\'application', '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(2, 'app_sigle', 'SGEC', 'string', 'general', 'Sigle officiel', '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(3, 'organisation_nom', 'Entreprise publique de la RDC', 'string', 'general', 'Nom de l\'organisation', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(4, 'pays', 'RDC', 'string', 'general', 'Pays', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(5, 'devise', 'CDF', 'string', 'general', 'Devise monétaire', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(6, 'fuseau_horaire', 'Africa/Kinshasa', 'string', 'general', 'Fuseau horaire', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(7, 'langue_defaut', 'fr', 'string', 'general', 'Langue par défaut', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(8, 'numero_format', 'COUR-{ANNEE}-{NUM}', 'string', 'courrier', 'Format de numérotation des courriers', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(9, 'delai_traitement_defaut', '7', 'int', 'courrier', 'Délai de traitement par défaut (jours)', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(10, 'confidentialite_defaut', 'INTERNE', 'string', 'courrier', 'Niveau de confidentialité par défaut', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(11, 'ocr_actif', '1', 'bool', 'ocr', 'Activer l\'OCR', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(12, 'ocr_langue', 'fra', 'string', 'ocr', 'Langue OCR principale', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(13, 'archive_duree_defaut', '5', 'int', 'archives', 'Durée de conservation par défaut (années)', '2026-09-30 19:41:20', '2026-09-30 19:41:20');

-- Listage de la structure de table gs_courrier. password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.password_reset_tokens : ~0 rows (environ)

-- Listage de la structure de table gs_courrier. permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_nom_unique` (`nom`),
  UNIQUE KEY `permissions_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.permissions : ~24 rows (environ)
INSERT INTO `permissions` (`id`, `nom`, `slug`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Voir les utilisateurs', 'users.view', 'Consulter la liste des utilisateurs', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(2, 'Créer un utilisateur', 'users.create', 'Ajouter un nouvel utilisateur', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(3, 'Modifier un utilisateur', 'users.update', 'Modifier un utilisateur existant', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(4, 'Supprimer un utilisateur', 'users.delete', 'Supprimer un utilisateur', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(5, 'Voir les rôles', 'roles.view', 'Consulter la liste des rôles', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(6, 'Créer un rôle', 'roles.create', 'Ajouter un nouveau rôle', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(7, 'Modifier un rôle', 'roles.update', 'Modifier un rôle existant', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(8, 'Supprimer un rôle', 'roles.delete', 'Supprimer un rôle', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(9, 'Voir les permissions', 'permissions.view', 'Consulter la liste des permissions', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(10, 'Créer une permission', 'permissions.create', 'Ajouter une nouvelle permission', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(11, 'Modifier une permission', 'permissions.update', 'Modifier une permission', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(12, 'Supprimer une permission', 'permissions.delete', 'Supprimer une permission', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(13, 'Voir la structure', 'structure.view', 'Consulter la structure organisationnelle', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(14, 'Gérer la structure', 'structure.manage', 'Créer/Modifier/Supprimer directions, départements, services', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(15, 'Voir les courriers', 'courriers.view', 'Consulter les courriers', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(16, 'Créer un courrier', 'courriers.create', 'Enregistrer un nouveau courrier', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(17, 'Modifier un courrier', 'courriers.update', 'Modifier un courrier', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(18, 'Supprimer un courrier', 'courriers.delete', 'Supprimer un courrier', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(19, 'Affecter un courrier', 'courriers.affecter', 'Affecter un courrier à un service/utilisateur', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(20, 'Annoter un courrier', 'courriers.annoter', 'Ajouter des annotations à un courrier', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(21, 'Valider un courrier', 'courriers.valider', 'Viser ou valider un courrier', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(22, 'Voir le journal d\'audit', 'audit.view', 'Consulter le journal d\'audit', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(23, 'Voir les paramètres', 'parametres.view', 'Consulter les paramètres généraux', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(24, 'Modifier les paramètres', 'parametres.update', 'Modifier les paramètres généraux', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(25, 'Voir tous les courriers', 'courriers.view.all', 'Accéder aux courriers de toutes les directions', '2026-10-01 07:28:47', '2026-10-01 07:28:47'),
	(26, 'Voir les courriers confidentiels', 'courriers.confidentiel.view', 'Accéder aux courriers de niveau CONFIDENTIEL', '2026-10-01 07:28:47', '2026-10-01 07:28:47'),
	(27, 'Voir les courriers très confidentiels', 'courriers.tres_confidentiel.view', 'Accéder aux courriers de niveau TRES_CONFIDENTIEL', '2026-10-01 07:28:47', '2026-10-01 07:28:47'),
	(28, 'Purger le journal d\'audit', 'audit.delete', 'Supprimer des entrées du journal d\'audit', '2026-10-01 07:28:47', '2026-10-01 07:28:47'),
	(29, 'Voir les projets de lettres', 'projets.view', 'Consulter les projets de lettres', '2026-10-01 15:38:43', '2026-10-01 15:38:43'),
	(30, 'Créer un projet de lettre', 'projets.create', 'Créer un projet de lettre', '2026-10-01 15:38:43', '2026-10-01 15:38:43'),
	(31, 'Modifier un projet de lettre', 'projets.update', 'Modifier, générer, importer et soumettre un projet de lettre', '2026-10-01 15:38:43', '2026-10-01 15:38:43'),
	(32, 'Valider un projet de lettre', 'projets.valider', 'Approuver, demander correction ou rejeter un projet', '2026-10-01 15:38:43', '2026-10-01 15:38:43'),
	(33, 'Signer un projet de lettre', 'projets.signer', 'Signer un projet de lettre validé', '2026-10-01 15:38:43', '2026-10-01 15:38:43');

-- Listage de la structure de table gs_courrier. personal_access_tokens
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.personal_access_tokens : ~3 rows (environ)
INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
	(1, 'App\\Models\\User', 1, 'sgec-token', '0195e1f35979d735c2c216fe01227188c0cb58baf6eeccca10ae554bc889adfc', '["*"]', '2026-09-30 20:00:19', NULL, '2026-09-30 19:42:08', '2026-09-30 20:00:19'),
	(2, 'App\\Models\\User', 1, 'sgec-token', 'ca0a1f7610434584501bcd9607284567346facd216e998143f23c46503122deb', '["*"]', '2026-09-30 20:20:53', NULL, '2026-09-30 20:02:53', '2026-09-30 20:20:53'),
	(11, 'App\\Models\\User', 4, 'sgec-token', '28b41ad7cc373cf113f6ea48703ad0b44d70241ead1365e21bc7e9728890a4f9', '["*"]', '2026-10-01 17:11:11', NULL, '2026-10-01 08:27:49', '2026-10-01 17:11:11'),
	(17, 'App\\Models\\User', 1, 'sgec-token', '81c1a860d3ef2f363a5dd4e5ed8002d65fc3c867b2ec478aa0c3f82201898bb4', '["*"]', '2026-10-01 17:30:41', NULL, '2026-10-01 09:33:38', '2026-10-01 17:30:41');

-- Listage de la structure de table gs_courrier. priorites
CREATE TABLE IF NOT EXISTS `priorites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `niveau` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `priorites_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.priorites : ~4 rows (environ)
INSERT INTO `priorites` (`id`, `code`, `libelle`, `niveau`, `created_at`, `updated_at`) VALUES
	(1, 'BASSE', 'Basse', 1, '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 'NORMALE', 'Normale', 2, '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 'HAUTE', 'Haute', 3, '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(4, 'URGENTE', 'Urgente', 4, '2026-09-30 19:41:20', '2026-09-30 19:41:20');

-- Listage de la structure de table gs_courrier. projets_lettres
CREATE TABLE IF NOT EXISTS `projets_lettres` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reference_projet` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courrier_entrant_id` bigint unsigned DEFAULT NULL,
  `dossier_id` bigint unsigned DEFAULT NULL,
  `objet` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destinataire` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_redacteur_id` bigint unsigned DEFAULT NULL,
  `createur_id` bigint unsigned NOT NULL,
  `signataire_id` bigint unsigned DEFAULT NULL,
  `statut` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BROUILLON',
  `date_creation` timestamp NULL DEFAULT NULL,
  `date_soumission` timestamp NULL DEFAULT NULL,
  `date_validation` timestamp NULL DEFAULT NULL,
  `date_signature` timestamp NULL DEFAULT NULL,
  `courrier_sortant_id` bigint unsigned DEFAULT NULL,
  `date_expedition` timestamp NULL DEFAULT NULL,
  `mode_expedition` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projets_lettres_reference_projet_unique` (`reference_projet`),
  KEY `projets_lettres_service_redacteur_id_foreign` (`service_redacteur_id`),
  KEY `projets_lettres_createur_id_foreign` (`createur_id`),
  KEY `projets_lettres_signataire_id_foreign` (`signataire_id`),
  KEY `projets_lettres_courrier_sortant_id_foreign` (`courrier_sortant_id`),
  KEY `projets_lettres_statut_index` (`statut`),
  KEY `projets_lettres_courrier_entrant_id_index` (`courrier_entrant_id`),
  CONSTRAINT `projets_lettres_courrier_entrant_id_foreign` FOREIGN KEY (`courrier_entrant_id`) REFERENCES `courriers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projets_lettres_courrier_sortant_id_foreign` FOREIGN KEY (`courrier_sortant_id`) REFERENCES `courriers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projets_lettres_createur_id_foreign` FOREIGN KEY (`createur_id`) REFERENCES `users` (`id`),
  CONSTRAINT `projets_lettres_service_redacteur_id_foreign` FOREIGN KEY (`service_redacteur_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projets_lettres_signataire_id_foreign` FOREIGN KEY (`signataire_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.projets_lettres : ~1 rows (environ)
INSERT INTO `projets_lettres` (`id`, `reference_projet`, `courrier_entrant_id`, `dossier_id`, `objet`, `destinataire`, `service_redacteur_id`, `createur_id`, `signataire_id`, `statut`, `date_creation`, `date_soumission`, `date_validation`, `date_signature`, `courrier_sortant_id`, `date_expedition`, `mode_expedition`, `created_at`, `updated_at`) VALUES
	(4, 'PL-2026-0001', 5, NULL, 'FINANCEMENT DU LOGICIEL', 'DANTIC', 7, 1, 4, 'ARCHIVE', '2026-10-01 16:58:29', '2026-10-01 16:59:58', '2026-10-01 17:00:34', '2026-10-01 17:01:55', 16, '2026-10-01 17:05:02', 'POSTE', '2026-10-01 16:58:29', '2026-10-01 17:24:46');

-- Listage de la structure de table gs_courrier. roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_nom_unique` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.roles : ~5 rows (environ)
INSERT INTO `roles` (`id`, `nom`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'Administrateur', 'Accès complet à toutes les fonctionnalités du système', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(2, 'Directeur', 'Directeur de direction, supervise les courriers et les agents', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(3, 'Chef de service', 'Chef de service, gère les affectations et le traitement', '2026-09-30 19:41:18', '2026-09-30 19:41:18'),
	(4, 'Agent', 'Agent de traitement, consulte et traite les courriers', '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(5, 'Consultation', 'Accès en lecture seule', '2026-09-30 19:41:19', '2026-09-30 19:41:19');

-- Listage de la structure de table gs_courrier. role_permissions
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` bigint unsigned NOT NULL,
  `permission_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `role_permissions_permission_id_foreign` (`permission_id`),
  CONSTRAINT `role_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.role_permissions : ~43 rows (environ)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
	(1, 1),
	(2, 1),
	(3, 1),
	(1, 2),
	(1, 3),
	(1, 4),
	(1, 5),
	(1, 6),
	(1, 7),
	(1, 8),
	(1, 9),
	(1, 10),
	(1, 11),
	(1, 12),
	(1, 13),
	(2, 13),
	(3, 13),
	(5, 13),
	(1, 14),
	(1, 15),
	(2, 15),
	(3, 15),
	(4, 15),
	(5, 15),
	(1, 16),
	(2, 16),
	(3, 16),
	(1, 17),
	(2, 17),
	(3, 17),
	(1, 18),
	(1, 19),
	(2, 19),
	(3, 19),
	(1, 20),
	(2, 20),
	(3, 20),
	(4, 20),
	(1, 21),
	(2, 21),
	(1, 22),
	(2, 22),
	(1, 23),
	(1, 24),
	(1, 25),
	(2, 25),
	(1, 26),
	(2, 26),
	(3, 26),
	(1, 27),
	(2, 27),
	(1, 28),
	(1, 29),
	(2, 29),
	(3, 29),
	(4, 29),
	(1, 30),
	(2, 30),
	(3, 30),
	(4, 30),
	(1, 31),
	(2, 31),
	(3, 31),
	(1, 32),
	(2, 32),
	(3, 32),
	(1, 33),
	(2, 33);

-- Listage de la structure de table gs_courrier. services
CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `departement_id` bigint unsigned NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `services_departement_id_code_unique` (`departement_id`,`code`),
  CONSTRAINT `services_departement_id_foreign` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.services : ~8 rows (environ)
INSERT INTO `services` (`id`, `departement_id`, `code`, `libelle`, `description`, `created_at`, `updated_at`) VALUES
	(1, 1, 'DG-SEC-COUR', 'Bureau du Courrier', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(2, 1, 'DG-SEC-ARCH', 'Archives', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(3, 2, 'DANTIC-DEV', 'Développement', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(4, 2, 'DANTIC-RES', 'Réseaux & Infrastructure', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(5, 3, 'DAF-RH-PAIE', 'Paie & Social', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(6, 4, 'DAF-FIN-COM', 'Comptabilité', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(7, 4, 'DAF-FIN-BUD', 'Budget', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(8, 5, 'DT-EXP-MNT', 'Maintenance', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19');

-- Listage de la structure de table gs_courrier. sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.sessions : ~0 rows (environ)

-- Listage de la structure de table gs_courrier. statut_courriers
CREATE TABLE IF NOT EXISTS `statut_courriers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `statut_courriers_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.statut_courriers : ~8 rows (environ)
INSERT INTO `statut_courriers` (`id`, `code`, `libelle`, `description`, `created_at`, `updated_at`) VALUES
	(1, 'ENREGISTRE', 'Enregistré', 'Courrier enregistré, en attente d\'affectation', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 'AFFECTE', 'Affecté', 'Courrier affecté à un service', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 'EN_COURS', 'En cours', 'Courrier en cours de traitement', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(4, 'TRAITE', 'Traité', 'Courrier traité', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(5, 'VALIDE', 'Validé', 'Courrier validé', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(6, 'CLOTURE', 'Clôturé', 'Courrier clôturé', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(7, 'REJETE', 'Rejeté', 'Courrier rejeté', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(8, 'ARCHIVE', 'Archivé', 'Courrier archivé', '2026-09-30 19:41:20', '2026-09-30 19:41:20');

-- Listage de la structure de table gs_courrier. type_courriers
CREATE TABLE IF NOT EXISTS `type_courriers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_courriers_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.type_courriers : ~3 rows (environ)
INSERT INTO `type_courriers` (`id`, `code`, `libelle`, `created_at`, `updated_at`) VALUES
	(1, 'ENTRANT', 'Courrier entrant', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(2, 'SORTANT', 'Courrier sortant', '2026-09-30 19:41:20', '2026-09-30 19:41:20'),
	(3, 'INTERNE', 'Courrier interne', '2026-09-30 19:41:20', '2026-09-30 19:41:20');

-- Listage de la structure de table gs_courrier. users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `direction_id` bigint unsigned DEFAULT NULL,
  `departement_id` bigint unsigned DEFAULT NULL,
  `service_id` bigint unsigned DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_direction_id_foreign` (`direction_id`),
  KEY `users_departement_id_foreign` (`departement_id`),
  KEY `users_service_id_foreign` (`service_id`),
  CONSTRAINT `users_departement_id_foreign` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_direction_id_foreign` FOREIGN KEY (`direction_id`) REFERENCES `directions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.users : ~3 rows (environ)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `actif`, `direction_id`, `departement_id`, `service_id`, `email_verified_at`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'Pierre Papy', 'pierrepapy@gmail.com', '$2y$12$OzhPg29V07TjzCzkV0VYc.BnEDHTMevsBaX7.j.7lt/oTj/6gJ0L.', 1, NULL, NULL, NULL, '2026-09-30 19:41:19', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(2, 'Robby Mukendi', 'directeur@sgec.cd', '$2y$12$WcpCU5kivmYpN5mzU0KQ0ewjIXgUqBo8pzy26KSLM2u85CRBOOPvi', 1, NULL, NULL, NULL, '2026-09-30 19:41:19', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(3, 'Agent Courrier', 'agent@sgec.cd', '$2y$12$npjBHi0cQ/RtiBOiUTm4R.L4hzPku6sWxieyZ8vpAreKkNZ5hMugS', 1, NULL, NULL, NULL, '2026-09-30 19:41:19', NULL, '2026-09-30 19:41:19', '2026-09-30 19:41:19'),
	(4, 'SALAMA NGOY', 'salama@gmail.com', '$2y$12$Kl3vFzr/V6ZJA8jGVVHwjeyHep2.lAvP8oXsCfB/ybit7cAfOU0K2', 1, 3, 5, 8, NULL, NULL, '2026-10-01 07:41:05', '2026-10-01 07:41:05');

-- Listage de la structure de table gs_courrier. user_roles
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `user_roles_role_id_foreign` (`role_id`),
  CONSTRAINT `user_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.user_roles : ~3 rows (environ)
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
	(1, 1),
	(2, 2),
	(4, 3),
	(3, 4);

-- Listage de la structure de table gs_courrier. validations_projets_lettres
CREATE TABLE IF NOT EXISTS `validations_projets_lettres` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `projet_lettre_id` bigint unsigned NOT NULL,
  `version_projet_id` bigint unsigned DEFAULT NULL,
  `valideur_id` bigint unsigned DEFAULT NULL,
  `decision` enum('APPROUVE','CORRECTION','REJETE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `observation` text COLLATE utf8mb4_unicode_ci,
  `date_decision` timestamp NULL DEFAULT NULL,
  `niveau_validation` int unsigned NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `validations_projets_lettres_projet_lettre_id_foreign` (`projet_lettre_id`),
  KEY `validations_projets_lettres_version_projet_id_foreign` (`version_projet_id`),
  KEY `validations_projets_lettres_valideur_id_foreign` (`valideur_id`),
  CONSTRAINT `validations_projets_lettres_projet_lettre_id_foreign` FOREIGN KEY (`projet_lettre_id`) REFERENCES `projets_lettres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `validations_projets_lettres_valideur_id_foreign` FOREIGN KEY (`valideur_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `validations_projets_lettres_version_projet_id_foreign` FOREIGN KEY (`version_projet_id`) REFERENCES `versions_projets_lettres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.validations_projets_lettres : ~1 rows (environ)
INSERT INTO `validations_projets_lettres` (`id`, `projet_lettre_id`, `version_projet_id`, `valideur_id`, `decision`, `observation`, `date_decision`, `niveau_validation`, `created_at`, `updated_at`) VALUES
	(4, 4, 8, 1, 'APPROUVE', NULL, '2026-10-01 17:00:34', 1, '2026-10-01 17:00:34', '2026-10-01 17:00:34');

-- Listage de la structure de table gs_courrier. versions_projets_lettres
CREATE TABLE IF NOT EXISTS `versions_projets_lettres` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `projet_lettre_id` bigint unsigned NOT NULL,
  `numero_version` int unsigned NOT NULL,
  `chemin_fichier` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom_fichier_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commentaire` text COLLATE utf8mb4_unicode_ci,
  `utilisateur_id` bigint unsigned DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT NULL,
  `est_version_finale` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `versions_projets_lettres_projet_lettre_id_numero_version_unique` (`projet_lettre_id`,`numero_version`),
  KEY `versions_projets_lettres_utilisateur_id_foreign` (`utilisateur_id`),
  KEY `versions_projets_lettres_est_version_finale_index` (`est_version_finale`),
  CONSTRAINT `versions_projets_lettres_projet_lettre_id_foreign` FOREIGN KEY (`projet_lettre_id`) REFERENCES `projets_lettres` (`id`) ON DELETE CASCADE,
  CONSTRAINT `versions_projets_lettres_utilisateur_id_foreign` FOREIGN KEY (`utilisateur_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listage des données de la table gs_courrier.versions_projets_lettres : ~1 rows (environ)
INSERT INTO `versions_projets_lettres` (`id`, `projet_lettre_id`, `numero_version`, `chemin_fichier`, `nom_fichier_original`, `commentaire`, `utilisateur_id`, `date_creation`, `est_version_finale`, `created_at`, `updated_at`) VALUES
	(8, 4, 1, 'projets_lettres/4/v001_1790881146.docx', 'Accusé_de_réception_COUR-2026-9003.docx', 'Version importée depuis Word', 1, '2026-10-01 16:59:06', 1, '2026-10-01 16:59:06', '2026-10-01 17:01:55');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
