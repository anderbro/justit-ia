<?php
session_start();

// Récupérer les données du formulaire
$formData = $_POST;
// Affichez les données dans la console
// error_log("FormData: " . print_r($formData, true));

include("../../bd.php");

$response = ["success" => false, "message" => ""];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        // Récupérer les données du formulaire
        $formData = $_POST;

        // Enregistrement dans la base de données
        $bdd = getBD();

        // Colonnes pour les tables
        $pvColumns = [];
        $dossierColumns = [];

        foreach ($formData as $key => $value) {
            // Si le champ contient "pv" dans le titre, mais n'est pas "date_pv_recouv", ajouter à la liste des colonnes PV
            if (stripos($key, 'pv') !== false && $key !== 'date_pv_recouv') {
                $pvColumns[$key] = $value;
            }

            // Si c'est "date_pv_recouv" ou "id_dossier", ajouter à la liste des colonnes Dossier
            if ($key === 'id_dossier') {
                $dossierColumns['num_dossier'] = $value;
            } else {
                $dossierColumns[$key] = $value;
            }
        }

        // Vérifier l'existence de id_dossier dans les données du formulaire
        if (empty($dossierColumns['num_dossier'])) {
            throw new Exception("Le champ id_dossier est obligatoire.");
        }

        // Afficher les colonnes PV dans la console avec les valeurs
        // error_log("PV Columns with Values:");
        foreach ($pvColumns as $col => $val) {
            // error_log("    $col: $val");
        }

        // Construire la requête SQL pour PV
        if (!empty($pvColumns)) {
            // Supprimer la colonne id_pv de la liste des colonnes
            unset($pvColumns['id_pv']);

            // Ajouter id_dossier à la liste des colonnes pour PV
            $pvColumns['id_dossier'] = $dossierColumns['num_dossier'];

            // Construire la liste des colonnes et des valeurs pour PV
            $pvColumnsList = implode(", ", array_keys($pvColumns));
            $pvValuesList = implode(", ", array_fill(0, count($pvColumns), '?'));

            $pvQuery = "INSERT INTO signalement_pv ($pvColumnsList) VALUES ($pvValuesList)";

            // Afficher la requête SQL pour PV dans la console
            // error_log("PV Query: " . $pvQuery);
            // error_log("PV Query with Values: " . implode(", ", array_values($pvColumns)));

            $stmtPV = $bdd->prepare($pvQuery);

            // Liaison des valeurs avec les paramètres pour PV
            $i = 1;
            foreach ($pvColumns as $col => $val) {
                $stmtPV->bindValue($i++, $val);
            }

            // Commentez la ligne ci-dessous pour éviter l'exécution réelle
            $stmtPV->execute();
        }


        // Construire la requête SQL pour Dossier
        if (!empty($dossierColumns)) {

            // Exclure les champs contenant "pv" sauf "date_pv_recouvrement" de la liste des colonnes pour Dossier
            $dossierColumns = array_filter($dossierColumns, function ($key) {
                return stripos($key, 'pv') === false || $key === 'date_pv_recouv';
            }, ARRAY_FILTER_USE_KEY);

            // Construire la liste des colonnes et des valeurs pour Dossier
            $dossierColumnsList = implode(", ", array_keys($dossierColumns));
            $dossierValuesList = implode(", ", array_fill(0, count($dossierColumns), '?'));

            $dossierQuery = "INSERT INTO dossier ($dossierColumnsList) VALUES ($dossierValuesList)";

            // Afficher la requête SQL pour Dossier dans la console
            // error_log("Dossier Query: " . $dossierQuery);
            // error_log("Dossier Query with Values: " . implode(", ", array_values($dossierColumns)));

            $stmtDossier = $bdd->prepare($dossierQuery);

            // Liaison des valeurs avec les paramètres pour Dossier
            $i = 1;
            foreach ($dossierColumns as $col => $val) {
                $stmtDossier->bindValue($i++, $val);
            }

            // Commentez la ligne ci-dessous pour éviter l'exécution réelle
            $stmtDossier->execute();
        }
        // Construire la requête SQL pour Tribunal Correctionnel
        if (!empty($dossierColumns)) {
            $tribunalQuery = "INSERT INTO tribunal_correctionnel (id_dossier) VALUES (?)";
            $stmtTribunal = $bdd->prepare($tribunalQuery);
            $stmtTribunal->bindValue(1, $dossierColumns['num_dossier']);
            $stmtTribunal->execute();
        }

        // Construire la requête SQL pour Cour d'Appel
        if (!empty($dossierColumns)) {
            $appelQuery = "INSERT INTO cours_appel (id_dossier) VALUES (?)";
            $stmtAppel = $bdd->prepare($appelQuery);
            $stmtAppel->bindValue(1, $dossierColumns['num_dossier']);
            $stmtAppel->execute();
        }

        // Construire la requête SQL pour Cour de Cassation
        if (!empty($dossierColumns)) {
            $cassationQuery = "INSERT INTO cour_cassation (id_dossier) VALUES (?)";
            $stmtCassation = $bdd->prepare($cassationQuery);
            $stmtCassation->bindValue(1, $dossierColumns['num_dossier']);
            $stmtCassation->execute();
        }


        // Si l'exécution réussit
        $response["success"] = true;
        $response["message"] = "Dossier enregistré avec succès";
    } catch (Exception $e) {
        // En cas d'erreur lors de l'enregistrement du dossier
        // error_log("Erreur lors de l'enregistrement du dossier : " . $e->getMessage());
        $response["message"] = "Erreur lors de l'enregistrement du dossier : " . $e->getMessage();
    } catch (PDOException $e) {
        // En cas d'erreur lors de l'exécution de la requête
        // error_log("Erreur lors de l'enregistrement du dossier : " . $e->getMessage());
        $response["message"] = "Erreur lors de l'enregistrement du dossier : " . $e->getMessage();
    }
} else {
    $response["message"] = "Méthode non autorisée";
}

// Affichez la réponse dans la console
// error_log("Response: " . print_r($response, true));

echo json_encode($response);
?>