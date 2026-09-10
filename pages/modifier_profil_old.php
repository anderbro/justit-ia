<?php
session_start();
$isLoggedIn = isset($_SESSION['utilisateur']);
?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modifier le Profil</title>
    <link rel="stylesheet" href="../styles/main.css" type="text/css" media="screen" />
    <script src="../libs/sweetalert/sweetalert2.all.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.18/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="../libs/bootstrap/css/bootstrap.min.css">
    <script src="../libs/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="../libs/jquery/jquery.js"></script>
    <script src="../js/modifier_profil.js"></script> <!-- Ajoutez le script pour la modification du profil -->
    <script src="https://kit.fontawesome.com/c6c76fd424.js" crossorigin="anonymous"></script>
    <script>
        const isLoggedIn = <?php echo json_encode($isLoggedIn); ?>;
        console.log(isLoggedIn);
    </script>
</head>

<body>

    <header class="d-flex justify-content-between align-items-center rounded">
        <img class="header-image" src="../img/Préfet_de_l'Hérault.svg.png" alt="Préfet de l'Hérault" />
        <div class="text-center">
            Bienvenue sur le site des affaires juridiques
        </div>

        <div class="right-top-div">
            <?php if (empty($_SESSION['utilisateur'])) { ?>
                <form>
                    <a class="btn btn-custom" href="../connexion/connexion.php">Se connecter</a>
                </form>
            <?php } ?>

            <?php if (isset($_SESSION['utilisateur'])) { ?>
                <form>
                    <button class="btn btn-custom" onclick="window.location.href='../connexion/deconnexion.php'">Se
                        déconnecter</button>
                </form>
            <?php } ?>
        </div>
    </header>

    <?php include('menu.php'); ?>

    <div class="container-modif">
        <h2>Modifier le Profil</h2>
        <div id="modifierProfilContainer"></div>
    </div>

</body>

</html>