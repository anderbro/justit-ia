<?php
session_start();
include("../../../bd.php");

$Id = isset($_GET['id']) ? $_GET['id'] : null;
error_log($Id);

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    if ($Id !== null) {
        try {
            $bdd = getBD();

            // Requête pour récupérer les avis
            $sqlAvis = "SELECT * FROM avis WHERE id_avis = :Id";
            $stmtAvis = $bdd->prepare($sqlAvis);
            $stmtAvis->bindParam(':Id', $Id, PDO::PARAM_INT);
            $stmtAvis->execute();
            $avis = $stmtAvis->fetchAll(PDO::FETCH_ASSOC);

            // Requête pour récupérer les numéros de soit transmis où id_avis = :Id
            $sqlSoitTransmis = "SELECT st.soit_trans_numero, st.id_parquet 
            FROM soit_transmis st
            INNER JOIN fais_objet fo ON st.id_soit_transmis = fo.id_soit_transmis
            WHERE fo.id_avis = :Id";
    $stmtSoitTransmis = $bdd->prepare($sqlSoitTransmis);
            $stmtSoitTransmis->bindParam(':Id', $Id, PDO::PARAM_INT);
            $stmtSoitTransmis->execute();
            $numerosSoitTransmis = $stmtSoitTransmis->fetchAll(PDO::FETCH_ASSOC);

            // Récupération du nom du parquet correspondant à l'ID de parquet
            $parquets = array();
            foreach ($numerosSoitTransmis as $soitTransmis) {
                $sqlParquet = "SELECT parquet FROM parquet WHERE id_parquet = :id_parquet";
                $stmtParquet = $bdd->prepare($sqlParquet);
                $stmtParquet->bindParam(':id_parquet', $soitTransmis['id_parquet'], PDO::PARAM_INT);
                $stmtParquet->execute();
                $parquet = $stmtParquet->fetch(PDO::FETCH_ASSOC);
                $parquets[] = $parquet['parquet'];
            }

            $bdd = null;

            header('Content-Type: application/json');
            echo json_encode(array('avis' => $avis, 'soit_transmis' => $numerosSoitTransmis, 'parquets' => $parquets)); // Modification ici
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'Erreur lors de la récupération des avis.'));
        }
    } else {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Identifiant non fourni.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>
