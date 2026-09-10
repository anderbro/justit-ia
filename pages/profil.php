<?php
session_start();
$isLoggedIn = isset($_SESSION['utilisateur']);
include("../pages/check_auth.php");

$assetsBase = '../';
$pageTitle = 'Mon profil';
$extraStylesheets = ['styles/main.css'];
$extraScriptsHead = ['js/profil.js', 'js/deconnexion_2.js'];
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
        <div class="profilcontmom">
            <div class="profilContainer">
                <div class="topcontprof">
                    <h2>Mon profil</h2>
                </div>
                <div class="botcontprof">
                    <img class="imgprof" src="../img/undraw_tabs_re_a2bd.svg" alt="">
                    <div id="profilContainer"></div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
