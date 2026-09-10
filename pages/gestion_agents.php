<?php
session_start();
$isLoggedIn = isset($_SESSION['utilisateur']);

$assetsBase = '../';
$pageTitle = 'Gestion des agents';
$extraStylesheets = ['styles/main.css', 'styles/agents.css'];
$extraScriptsHead = ['js/agents.js', 'js/deconnexion_2.js'];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <?php include __DIR__ . '/../includes/head.php'; ?>
    <script>
        const isLoggedIn = <?php echo json_encode($isLoggedIn); ?>;
    </script>
</head>
<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>

    <main class="contmom">
        <div class="page-heading">
            <h2>Gestion des agents</h2>
        </div>

        <div id="tableContainer"></div>
        <button type="button" id="btnNouvelAgent">Nouvel agent</button>

        <div id="modalFormAgent" class="modal">
            <div class="modale-content">
                <span class="close">&times;</span>
                <form id="formAjoutAgent">
                    <label for="nom">Nom :</label>
                    <input type="text" id="nom" name="nom" required><br>
                    <label for="prenom">Prénom :</label>
                    <input type="text" id="prenom" name="prenom" required><br>
                    <label for="role">Rôle :</label>
                    <select id="role" name="role" required>
                        <option value="juriste">juriste</option>
                        <option value="contrôleur">contrôleur</option>
                    </select><br>
                    <label for="service">Service :</label>
                    <select id="service" name="service" required>
                        <option value="SATO">SATO</option>
                        <option value="STU">STU</option>
                        <option value="SAJ">SAHJ</option>
                    </select><br>
                    <button type="button" id="btnAjouterAgent">Ajouter agent</button>
                </form>
            </div>
        </div>

        <div id="result"></div>

        <div id="modalFormAgentModif" class="modal">
            <div class="modale-content">
                <span class="close">&times;</span>
                <form id="formModifierAgent">
                    <label for="nomModif">Nom :</label>
                    <input type="text" id="nomModif" name="nomModif" required><br>
                    <label for="prenomModif">Prénom :</label>
                    <input type="text" id="prenomModif" name="prenomModif" required><br>
                    <label for="roleModif">Rôle :</label>
                    <select id="roleModif" name="roleModif" required>
                        <option value="juriste">juriste</option>
                        <option value="contrôleur">contrôleur</option>
                    </select><br>
                    <label for="serviceModif">Service :</label>
                    <select id="serviceModif" name="serviceModif" required>
                        <option value="SATO">SATO</option>
                        <option value="STU">STU</option>
                        <option value="SAJ">SAHJ</option>
                    </select><br>
                    <button type="button" id="btnModifierAgent">Modifier agent</button>
                </form>
            </div>
        </div>
    </main>
</body>
</html>
