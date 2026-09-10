<?php
session_start();
$isLoggedIn = isset($_SESSION['utilisateur']);

$assetsBase = '../';
$pageTitle = 'Modifier le profil';
$extraStylesheets = ['styles/main.css'];
$extraScriptsHead = ['js/modifier_profil.js', 'js/deconnexion_2.js'];
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
        <div class="container-modif" style="display: flex;">
            <h2>Modifier le profil</h2>
            <div id="modifierProfilContainer"></div>
        </div>
    </main>
</body>
</html>
