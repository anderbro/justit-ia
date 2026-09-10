<?php
session_start();
$isLoggedIn = isset($_SESSION['utilisateur']);

$assetsBase = '../';
$pageTitle = 'Gestion des profils';
$extraStylesheets = ['styles/main.css'];
$extraScriptsHead = ['js/gestion_profils.js', 'js/deconnexion_2.js'];
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
                <h2>Gestion des profils</h2>
                <p style="color: var(--color-text-muted); margin-top: -0.5rem;">Utilisateurs et rôles</p>
            </div>
            <div id="userListContainer"></div>
        </div>
    </main>
</body>
</html>
