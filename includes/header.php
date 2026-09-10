<?php
$prefix = isset($assetsBase) ? $assetsBase : '../';
?>
<header class="app-header prenav">
    <div class="app-header__brand">
        <img class="header-image" src="<?php echo $prefix; ?>img/Préfet_de_l'Hérault.svg.png" alt="Préfecture de l'Hérault" />
        <div class="app-header__title text-center">Affaires Juridiques</div>
    </div>

    <?php include __DIR__ . '/nav.php'; ?>

    <?php if (isset($_SESSION['utilisateur'])): ?>
        <form class="logoutbuttoncontainer" action="#" method="post">
            <button type="button" id="logoutButton" class="btn-app btn-app--outline btn-app--sm">Se déconnecter</button>
        </form>
    <?php endif; ?>
</header>
