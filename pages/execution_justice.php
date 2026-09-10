<?php

session_start();
?>

<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="styles/main.css" type="text/css" media="screen" />
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <script src="https://kit.fontawesome.com/c6c76fd424.js" crossorigin="anonymous"></script>
    <title>Bienvenue sur le site des affaires juridiques</title>
    <?php
    // Inclure votre fichier de connexion à la base de données si nécessaire
    include("../bd.php");
    $bdd = getBD();
    ?>
    <style>
        /* Styles pour le header */
        body {
            font-family: Arial, sans-serif;
        }

        header {
            font-size: 2.2rem;
            color: #465f9d; /* Texte en bleu */
            padding: 1rem;
            text-align: center; /* Texte aligné à gauche */
            background-color: white; /* Fond blanc */
            border: 1px solid #465f9d; /* Bordure bleue */
            border-radius: 0; /* Pas de bordure arrondie */
        }

        .header-image {
            float: left;
            margin-right: 10px;
            width: 65px; /* Largeur en pixels */
            height: auto;
        }       

        /* Styles pour le menu gauche */
        .menu {
            float: left;
            margin: 30px;
            padding: 20px;
            margin-left: 2%;
            height: 700px; /* Aligner le menu en bas de la fenêtre */
            width: 10%;
            background-color: #f2f2f2;
            border: 1px solid black;
            border-radius: 5px;
            box-shadow: 2px 2px 5px #ccc;
            vertical-align: top;
           
            }

            .menu ul {
                list-style: none; 
                padding: 0; /* Enlever la marge intérieure de la liste non ordonnée */
            }

            .menu li {
                margin-bottom: 20%; /* Espacement entre les différents éléments du menu */
            }

        .menu a {
            text-decoration: none; 
            display: block; 
            padding: 10px 15px; 
            background-color: white ; 
            color: #465f9d; 
            border-radius: 5px ; 
            border : solid #465f9d 2px;
         
        }

        .menu img {
            width: 16px; /* Largeur de la taille d'une icône fas */
            height: 16px; /* Hauteur de la taille d'une icône fas */
            margin-right: 10px; /* Espacement à droite de l'image */
        }
  

        /* Autres styles restent inchangés */
        .container {
            width: 200px;
            display: flex;
            flex-direction: column;
        }

        label {
            font-weight: bold;
        }

        input[type="submit"] {
            background-color: #465f9d;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            float: right;
            margin-top: 10px;
        }

        input[type="submit"]:hover {
            background-color: #465f9d;
        }

        .redacteur,
        .recherche_arrete {
            display: inline-block;
            margin: 30px;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f2f2f2;
            border: 1px solid black;
            border-radius: 5px;
            box-shadow: 2px 2px 5px #ccc;
            vertical-align: top;
            height: auto;
            width: 350px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 20px;
        }

        label {
            font-weight: bold;
            margin-bottom: 5px;
        }

        input,
        textarea,
        select {
            padding: 5px;
            border-radius: 5px;
            border: 1px solid #ccc;
            width: 100%;
            margin-top: 10px;
        }

        .right-top-div {
            color: white;
            /* padding: 12px 20px; */
            border: none;
            border-radius: 4px;
            cursor: pointer;
            float: right;
            margin-top: 2%;
            margin-right: 10%;
            position: absolute;
            top: 0;
            right: 0;
            z-index: 1;
        }

        .consultation-container {
            float: left;
            margin: 30px;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f2f2f2;
            border: 1px solid black;
            border-radius: 5px;
            box-shadow: 2px 2px 5px #ccc;
            vertical-align: top;
            height: auto;
            width: 350px;
        }
    </style>
</head>
<body>
    <header>
        <!-- Image à l'extrême gauche -->
        <img class="header-image" src="../img/Préfet_de_l'Hérault.svg.png" alt="Préfet de l'Hérault" />
        Bienvenue sur le site des affaires juridiques
    </header>

    <div class="right-top-div">
        <?php
        if (($_SESSION['utilisateur']) == []) {

            ?>
            <form>
                <input type="button" value="Se connecter" onclick="window.location.href='connexion/connexion.php'" />
            </form>

        <?php }
        ?>


        <?php
        if (isset($_SESSION['utilisateur'])) {

            ?>
            <form>
                <input type="button" value="Se déconnecter" onclick="window.location.href='connexion/deconnexion.php'" />
            </form>
        <?php }
        ?>
    </div>


    <div class="menu">
    <!-- Menu gauche -->
    <ul>
        <li><a href="../index.php"><img src="../img/page-daccueil.png" alt="Accueil" />Accueil</a></li>
        <li><a href=""><img src="../img/burger-bar.png" alt="Menu 1" /> Menu 1</a></li>
        <li><a href="parametres.php"><img src="../img/parametres.png" alt="Parametres" />Parametres</a></li>
        <li><a href="statistiques.php"><img src="../img/tableau-statistique.png" alt="Statistiques" />Statistiques</a></li>
        <li><a href="execution_justice.php"><img src="../img/utilisateur.png" alt="Profil" />Executions de justice</a></li>
        <li><a href="signalement_infraction.php"><img src="../img/utilisateur.png" alt="Profil" />Signalements infraction </a></li>
        <li><a href="suivi_dossier.php"><img src="../img/utilisateur.png" alt="Profil" />Suivi de dossier</a></li>
        <li><a href="profil.php"><img src="../img/utilisateur.png" alt="Profil" /> Profil</a></li>
    </ul>
</div>

</div>

    <div class="content">
        
        <h1>Executions de justice</h1>
        <p>Ceci est la page des Executions de justice </p>
        
        <section class="consultation-container">
            <h1>Résultat de la consultation pour le dossier</h1>
            <div class="consultation-result">
            <?php

                $rep = $bdd->query(consult_dossier($_POST['num_dossier']));

                // Tableau des champs à exclure
                $excludedFields = ['id_dossier', 'libelle_arret_astreinte', 'date_ait', 'nom_arretes_astreintes', 'libelle_jugement_astreinte', 'nb_annul', 'obs_ddfip', 'obs_decision_cont_astr', 'annee_cloture', 'obs_decision_cont_astr', 'obs_decision_cont_astr', 'obs_decision_cont_astr']; // Ajoutez les champs à exclure ici

                function consult_dossier(string $ref)
                {
                    $sql = 'select * from dossier where num_dossier="' . $ref . '";';
                    return $sql;
                }

                if ($_POST['num_dossier'] == "") {
                    echo '<meta http-equiv="Refresh" content="0; url=../erreur/error.php">';
                } else {
                    $res = $rep->fetch(PDO::FETCH_ASSOC);

                    echo '<p>';
                    foreach ($res as $key => $value) {
                        // Vérifiez si le champ en cours de traitement est exclu
                        if (!in_array($key, $excludedFields) && !empty($value)) {
                            echo $key . ': ' . $value . '<br>';
                        }
                    }
                    echo '</p>';
                }

                if (isset($_SESSION['utilisateur'])) {
                    echo '<form method="post" action="editer_dossier.php">';
                    echo '<input type="hidden" name="num_dossier" value="' . $res['num_dossier'] . '">';
                    echo '<button type="submit" name="edit_button" class="custom-button">Éditer</button>';
                    echo '</form>';

                    // Bouton de suppression
                    echo '<form method="post" action="../pages/suppresion/suppression_dossier.php">';
                    echo '<input type="hidden" name="num_dossier" value="' . $res['num_dossier'] . '">';
                    echo '<button type="submit" name="delete_button" class="custom-button">Supprimer</button>';
                    echo '</form>';
                }
            ?>

            </div>
            <?php
            $rep->closeCursor();
            ?>
        </section>

  

    </div>
</body>
</html>
