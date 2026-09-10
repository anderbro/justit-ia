<?php
$assetsBase = '../../';
$pageTitle = 'Connexion';
$extraScriptsHead = ['js/connexion.js'];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <?php include __DIR__ . '/../../includes/head.php'; ?>
</head>
<body class="auth-page">
    <div class="auth-card">
        <div class="auth-card__hero">
            <img class="prefet" src="../../img/Préfet_de_l'Hérault.svg.png" alt="">
            <h1>Affaires Juridiques</h1>
            <p>Plateforme de gestion des dossiers et procédures — DDTM de l'Hérault</p>
            <div class="auth-card__illustration">
                <img src="../../img/undraw_login_re_4vu2 (1).svg" alt="">
            </div>
        </div>
        <div class="auth-card__form">
            <div class="auth-card__form-header">
                <h2>Connexion</h2>
            </div>
            <div id="connexionFormContainer"></div>
            <p class="auth-footer-link">Accès réservé aux agents habilités</p>
        </div>
    </div>
</body>
</html>
