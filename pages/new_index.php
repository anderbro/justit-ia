<?php
session_start();

// include("/pages/check_auth.php");
$isLoggedIn = isset($_SESSION['utilisateur']);
// echo "<pre>";
// print_r($_SESSION);
// echo "</pre>";
?>

<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="../styles/main.css" type="text/css" media="screen" />
    <!-- SWEETALERT -->
    <script src="../libs/sweetalert/sweetalert2.all.min.js"></script>
    <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.0.18/dist/sweetalert2.min.css"> -->
    <!-- BOOTSTRAP -->
    <link rel="stylesheet" href="../libs/bootstrap/css/bootstrap.min.css">
    <!-- BOOTSTRAP -->
    <script src="../libs/bootstrap/js/bootstrap.bundle.min.js"></script>
    <!-- JQUERY -->
    <script src="../libs/jquery/jquery.js"></script>
    <!-- JS -->

    <script src="../js/accueil.js"></script>
    <script src="../js/recherche.js"></script>
    <script src="../js/deconnexion.js"></script>


    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <!-- <script src="https://kit.fontawesome.com/c6c76fd424.js" crossorigin="anonymous"></script> -->
    <title>Bienvenue sur le site des affaires juridiques</title>
    <?php
    include("../bd.php");
    $bdd = getBD();
    ?>


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


            <?php if (isset($_SESSION['utilisateur'])) { ?>
                <form>
                    <button id="logoutButton" class="btn btn-custom">Se déconnecter</button>
                </form>
            <?php } ?>
        </div>
    </header>



    <?php include('menu.php'); ?>



    <!-- ... Votre code HTML précédent ... -->

    <div class="recherche_dossier">
        <form id="searchForm" method="post" enctype="multipart/form-data">
            <div class="input-group">
                <input type="text" class="form-control" id="search_keyword" name="search_keyword"
                    placeholder="Recherche d'un dossier par mot-clé">
                <button type="submit" name="search_by_keyword" class="btn btn-primary"
                    style="background-color:#465f9d; margin-left: 10px;">Rechercher</button>
            </div>
        </form>
    </div>







    <div class="button-container" id="creation">

        <button type="button" id="createDossierButton" class="btn btn-primary"
            style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;margin-top: 25px;background-color:#465f9d;">
            Créer un dossier
        </button>




    </div>

    </div>

    <div id="resultContainer" class="result-container"></div>






</body>

</html>