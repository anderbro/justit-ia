<?php
session_start();
$isLoggedIn = isset($_SESSION['utilisateur']);

$assetsBase = '../';
$pageTitle = 'Administration';
$extraStylesheets = ['styles/main.css'];
$extraScriptsHead = ['js/administration.js', 'js/deconnexion_2.js'];
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
        <div class="settingsaccountcontmom">
            <div class="settingsaccounttilttle">
                <h2>Paramètres</h2>
                <p style="color: var(--color-text-muted); margin-top: -0.5rem;">Administration de la plateforme</p>
            </div>
            <div class="settingaccountbuttoncont">
                <div>
                    <h3 style="font-size: 1rem; margin: 0 0 0.5rem;">Comptes</h3>
                    <p style="font-size: 0.875rem; color: var(--color-text-muted); margin: 0 0 1rem;">Créer un nouvel utilisateur</p>
                    <button type="button" id="toggleAuthButtonInscription">Créer un compte</button>
                </div>
                <div>
                    <h3 style="font-size: 1rem; margin: 0 0 0.5rem;">Droits</h3>
                    <p style="font-size: 0.875rem; color: var(--color-text-muted); margin: 0 0 1rem;">Gérer les rôles et permissions</p>
                    <a id="gestionDroits" href="gestion_profils.php">Gestion des utilisateurs</a>
                </div>
                <div>
                    <h3 style="font-size: 1rem; margin: 0 0 0.5rem;">Agents</h3>
                    <p style="font-size: 0.875rem; color: var(--color-text-muted); margin: 0 0 1rem;">Référentiel des agents</p>
                    <a id="gestionAgents" href="gestion_agents.php">Gestion des agents</a>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
