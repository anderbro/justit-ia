<?php
session_start();
include("../../bd.php");

$response = ["success" => false, "message" => ""];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $bdd = getBD();

    // Vous pouvez modifier la requête SQL en fonction de votre structure de base de données
    $queryDossier = "SELECT * FROM dossier";
    $querySignalementPv = "SELECT * FROM signalement_pv";

    $resultDossier = $bdd->query($queryDossier);
    $resultSignalementPv = $bdd->query($querySignalementPv);

    if ($resultDossier && $resultSignalementPv) {
        // Récupérer les noms des colonnes (champs) de la table dossier
        $columnsDossier = [];
        for ($i = 0; $i < $resultDossier->columnCount(); $i++) {
            $column = $resultDossier->getColumnMeta($i);
            // Exclure les colonnes avec les identifiants auto-incrémentés
            if ($column['name'] !== 'id_dossier') {
                $columnsDossier[] = $column['name'];
            }
        }

        // Récupérer les noms des colonnes (champs) de la table signalement_pv
        $columnsSignalementPv = [];
        for ($i = 0; $i < $resultSignalementPv->columnCount(); $i++) {
            $column = $resultSignalementPv->getColumnMeta($i);
            // Exclure les colonnes avec les identifiants auto-incrémentés
            if ($column['name'] !== 'id_pv' && $column['name'] !== 'id_dossier') {
                $columnsSignalementPv[] = $column['name'];
            }
        }

        // Fermer les requêtes
        $resultDossier->closeCursor();
        $resultSignalementPv->closeCursor();

        // Fusionner les colonnes des deux tables
        $mergedColumns = array_merge($columnsDossier, $columnsSignalementPv);

        // Retourner les noms des colonnes au format JSON
        $response["success"] = true;
        $response["message"] = "Noms des champs récupérés avec succès";
        $response["data"] = $mergedColumns;
    } else {
        $response["message"] = "Erreur lors de la récupération des noms de champs de la base de données";
    }
} else {
    $response["message"] = "Méthode non autorisée";
}

echo json_encode($response);
?>