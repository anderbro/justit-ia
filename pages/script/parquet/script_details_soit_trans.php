<?php
session_start();
include("../../../bd.php");

$Id = isset($_GET['id']) ? $_GET['id'] : null;

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    if ($Id !== null) {
        try {
            $bdd = getBD();

            // Requête pour extraire les données des soit_transmis
            $sqlSoitTransmis = "SELECT 
                id_soit_transmis,
                soit_trans_numero,
                soit_trans_damande_parquet,
                soit_trans_date_premiere_audition,
                soit_trans_date_limite_enquete,
                soit_trans_priorite,
                soit_trans_traite,
                soit_trans_observation,
                id_parquet,
                id_avis
            FROM 
                soit_transmis
            WHERE 
                id_dossier = :id";

            error_log("Requête SQL soit_transmis : " . $sqlSoitTransmis); // Retour console pour débogage

            $stmtSoitTransmis = $bdd->prepare($sqlSoitTransmis);
            $stmtSoitTransmis->bindParam(':id', $Id, PDO::PARAM_INT);
            $stmtSoitTransmis->execute();

            $soitTransmisData = $stmtSoitTransmis->fetchAll(PDO::FETCH_ASSOC);

            
            $bdd = null;

            error_log("SoitTransmis récupérés : " . print_r($soitTransmisData, true)); // Retour console pour débogage

            header('Content-Type: application/json');
            echo json_encode(array(
                'soitTransmisData' => $soitTransmisData
            ));
        } catch (PDOException $e) {
            error_log("Erreur PDO : " . $e->getMessage()); // Retour console pour débogage
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'Erreur lors de la récupération des données.'));
        }
    } else {
        error_log("ID non fourni."); // Retour console pour débogage
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Identifiant non fourni.'));
    }
}
?>
