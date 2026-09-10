<?php
session_start();
$isLoggedIn = isset($_SESSION['utilisateur']);
include(__DIR__ . '/check_auth.php');
include(__DIR__ . '/../bd.php');

$bdd = getBD();
$communesStmt = $bdd->query("SELECT commune FROM comm_arr ORDER BY commune ASC");
$communes = $communesStmt->fetchAll(PDO::FETCH_COLUMN);

$assetsBase = '../';
$pageTitle = 'Création de dossier';
$extraStylesheets = ['styles/main.css', 'styles/creation.css'];
$extraScriptsHead = ['js/creation.js', 'js/deconnexion_2.js'];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <?php include __DIR__ . '/../includes/head.php'; ?>
</head>
<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>

    <main class="contmom creation-page">
        <div class="creation-wrap">
            <div class="page-heading">
                <h1>Création d'un dossier</h1>
                <p>Déposez un scan pour préremplir le formulaire, puis vérifiez les champs avant de créer le dossier.</p>
            </div>

            <div id="aiDropzone" class="ai-dropzone">
                <input type="file" id="aiDocument" accept=".pdf,image/png,image/jpeg,image/tiff,image/webp" hidden>
                <div class="ai-dropzone__copy">
                    <strong>Remplir avec un document</strong>
                    <span>PDF ou image (PV, soit-transmis, courrier). L’analyse reste locale dans Docker.</span>
                </div>
                <button type="button" id="aiPickButton" class="btn-app btn-app--outline">Choisir un fichier</button>
            </div>
            <p id="aiStatus" class="ai-status" hidden></p>
            <script type="application/json" id="communesJson"><?php echo json_encode(array_values($communes), JSON_UNESCAPED_UNICODE); ?></script>

            <form id="creationForm" class="creation-form" novalidate>
                <div class="creation-grid">
                    <div class="form-group">
                        <label for="numero_dossier">Numéro de dossier</label>
                        <input type="text" id="numero_dossier" name="numero_dossier" class="form-control" required placeholder="Ex. DOS-2026-002" autocomplete="off">
                    </div>

                    <div class="form-group">
                        <label for="commune">Commune</label>
                        <select id="commune" name="commune" class="form-control">
                            <option value="">Sélectionner une commune</option>
                            <?php foreach ($communes as $commune): ?>
                                <option value="<?php echo htmlspecialchars($commune, ENT_QUOTES, 'UTF-8'); ?>">
                                    <?php echo htmlspecialchars($commune, ENT_QUOTES, 'UTF-8'); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="priorite">Priorité</label>
                        <select id="priorite" name="priorite" class="form-control">
                            <option value="">Non renseignée</option>
                            <option value="P1">P1</option>
                            <option value="P2">P2</option>
                            <option value="P3">P3</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="date_du_soit_transmis">Date du soit-transmis</label>
                        <input type="date" id="date_du_soit_transmis" name="date_du_soit_transmis" class="form-control">
                    </div>

                    <div class="form-group">
                        <label for="parcelle_principale">Parcelle principale</label>
                        <input type="text" id="parcelle_principale" name="parcelle_principale" class="form-control" placeholder="Ex. AB-123">
                    </div>

                    <div class="form-group">
                        <label for="parcelles_secondaires">Parcelles secondaires</label>
                        <input type="text" id="parcelles_secondaires" name="parcelles_secondaires" class="form-control">
                    </div>

                    <div class="form-group">
                        <label for="date_courrier">Date de courrier</label>
                        <input type="date" id="date_courrier" name="date_courrier" class="form-control">
                    </div>
                </div>

                <div class="creation-flags">
                    <fieldset class="radio-group">
                        <legend>Cabanisation</legend>
                        <label class="radio-option">
                            <input type="radio" name="cabanisation" value="Oui">
                            Oui
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="cabanisation" value="Non" checked>
                            Non
                        </label>
                    </fieldset>

                    <fieldset class="radio-group">
                        <legend>Dossier sensible</legend>
                        <label class="radio-option">
                            <input type="radio" name="dossier_sensible" value="Oui">
                            Oui
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="dossier_sensible" value="Non" checked>
                            Non
                        </label>
                    </fieldset>

                    <fieldset class="radio-group">
                        <legend>Détruit</legend>
                        <label class="radio-option">
                            <input type="radio" name="detruit" value="Oui">
                            Oui
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="detruit" value="Non" checked>
                            Non
                        </label>
                    </fieldset>
                </div>

                <div class="form-group form-group--full">
                    <label for="observations">Observations</label>
                    <textarea id="observations" name="observations" class="form-control" rows="5"></textarea>
                </div>

                <div class="creation-actions">
                    <a href="../index.php" class="btn-app btn-app--outline">Annuler</a>
                    <button type="submit" id="submitButton" class="btn-app">Créer le dossier</button>
                </div>
            </form>
        </div>
    </main>
</body>
</html>
