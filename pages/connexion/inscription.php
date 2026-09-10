<?php
$assetsBase = '../../';
$pageTitle = 'Inscription';
$extraScriptsHead = ['js/inscription.js'];
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
            <h1>Nouveau compte</h1>
            <p>Création d'un accès utilisateur pour la plateforme Affaires Juridiques</p>
            <div class="auth-card__illustration">
                <img src="../../img/undraw_sign_up_n6im.svg" alt="">
            </div>
        </div>
        <div class="auth-card__form">
            <div class="auth-card__form-header">
                <h2>Inscription</h2>
                <a href="../administration.php" class="auth-back" title="Retour à l'administration">
                    <img src="../../img/arrow-left-solid.svg" alt="Retour">
                </a>
            </div>
            <div id="inscriptionFormContainer"></div>
        </div>
    </div>
</body>
</html>
