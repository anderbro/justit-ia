<?php
session_start();
$isLoggedIn = isset($_SESSION['utilisateur']);
include("./pages/check_auth.php");
include("./bd.php");
$bdd = getBD();

$assetsBase = '';
$pageTitle = 'Accueil';
$extraStylesheets = ['styles/main.css'];
$extraScriptsHead = ['js/accueil.js', 'js/deconnexion.js', 'js/filtres.js'];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <?php include __DIR__ . '/includes/head.php'; ?>
</head>
<body>
    <?php include __DIR__ . '/includes/header.php'; ?>

    <main class="contmom">
        <div class="pagecont">
            <div class="topcont">
                <form id="searchForm" method="post" enctype="multipart/form-data" class="recherchecont">
                    <input type="text" class="searchbar" id="search_keyword" name="search_keyword"
                        placeholder="Rechercher un dossier…" aria-label="Rechercher un dossier">
                    <button type="submit" name="search_by_keyword" class="searchbutton">Rechercher</button>
                </form>

                <div class="filtrecont">
                    <button type="button" id="detailsButton">Filtres</button>
                    <div id="bulle" class="bulle" role="dialog" aria-label="Filtres des dossiers">
                        <form id="filtreForm" class="filtre-form">
                            <p class="filtre-title">Filtrer le tableau</p>

                            <label for="filtreCommune">Commune
                                <select id="filtreCommune" name="commune">
                                    <option value="">Toutes les communes</option>
                                </select>
                            </label>

                            <label for="filtreAnnee">Année
                                <select id="filtreAnnee" name="annee">
                                    <option value="">Toutes les années</option>
                                </select>
                            </label>

                            <label for="filtreContrevenant">Contrevenant
                                <select id="filtreContrevenant" name="contrevenant">
                                    <option value="">Tous les contrevenants</option>
                                </select>
                            </label>

                            <label for="filtrePriorite">Priorité
                                <select id="filtrePriorite" name="priorite">
                                    <option value="">Toutes les priorités</option>
                                </select>
                            </label>

                            <label for="filtreCabanisation">Cabanisation
                                <select id="filtreCabanisation" name="cabanisation">
                                    <option value="">Tous</option>
                                    <option value="oui">Oui</option>
                                    <option value="non">Non</option>
                                </select>
                            </label>

                            <label for="filtreSensible">Dossier sensible
                                <select id="filtreSensible" name="sensible">
                                    <option value="">Tous</option>
                                    <option value="1">Oui</option>
                                    <option value="0">Non</option>
                                </select>
                            </label>

                            <label for="filtreArchivage">Archivage
                                <select id="filtreArchivage" name="archivage">
                                    <option value="">Tous</option>
                                    <option value="0">Non archivés</option>
                                    <option value="1">Archivés uniquement</option>
                                </select>
                            </label>

                            <div class="filtre-actions">
                                <button type="button" id="filtreReset" class="btn-app btn-app--outline">Réinitialiser</button>
                                <button type="submit" class="btn-app">Appliquer</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="button-container" id="creation">
                    <button type="button" id="createDossierButton">Créer un dossier</button>
                </div>
            </div>

            <div class="resultcontmom">
                <div id="resultContainer" class="result-container"></div>
            </div>
        </div>
    </main>
</body>
</html>
