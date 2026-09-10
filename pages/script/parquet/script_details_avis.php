<?php
session_start();
include("../../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Requête pour extraire tous les avis avec les informations complémentaires
        $sqlSoitTransmis = "SELECT avis.*, soit_transmis.*, parquet.parquet
                            FROM avis
                            LEFT JOIN soit_transmis ON avis.id_avis = soit_transmis.id_avis
                            LEFT JOIN parquet ON soit_transmis.id_parquet = parquet.id_parquet";

        error_log("Requête SQL soit_transmis : " . $sqlSoitTransmis); // Retour console pour débogage

        $stmtSoitTransmis = $bdd->prepare($sqlSoitTransmis);
        $stmtSoitTransmis->execute();

        $avisData = $stmtSoitTransmis->fetchAll(PDO::FETCH_ASSOC);

        $bdd = null;

        error_log("SoitTransmis récupérés : " . print_r($avisData, true)); // Retour console pour débogage

        header('Content-Type: application/json');
        echo json_encode(array(
            'SoitTransmis' => $avisData,
        ));
    } catch (PDOException $e) {
        // Gestion des erreurs PDO
        header('Content-Type: application/json');
        echo json_encode(array(
            'error' => 'Erreur: ' . $e->getMessage()
        ));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array(
        'error' => 'Accès non autorisé'
    ));
}
?>
