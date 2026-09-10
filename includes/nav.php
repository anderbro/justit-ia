<?php
$prefix = isset($assetsBase) ? $assetsBase : '../';
$menuItems = [
    ['url' => $prefix . 'index.php', 'name' => 'Accueil', 'icon' => $prefix . 'img/page-daccueil.png'],
    ['url' => $prefix . 'pages/administration.php', 'name' => 'Administration', 'icon' => $prefix . 'img/parametres.png'],
    ['url' => '#', 'name' => 'Statistiques', 'icon' => $prefix . 'img/tableau-statistique.png'],
    ['url' => $prefix . 'pages/profil.php', 'name' => 'Profil', 'icon' => $prefix . 'img/utilisateur.png'],
];
?>
<nav class="app-nav navicon" aria-label="Navigation principale">
    <ul>
        <?php foreach ($menuItems as $item): ?>
            <li>
                <a href="<?php echo htmlspecialchars($item['url']); ?>">
                    <img src="<?php echo htmlspecialchars($item['icon']); ?>" alt="" width="18" height="18" />
                    <span><?php echo htmlspecialchars($item['name']); ?></span>
                </a>
            </li>
        <?php endforeach; ?>
    </ul>
</nav>
