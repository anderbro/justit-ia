<?php
session_start();
include("../../../bd.php");

$Id = isset($_GET['id']) ? $_GET['id'] : null;

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    if ($Id !== null) {
        try {
            $bdd = getBD();

            // Requête pour extraire les données du soit_transmis avec l'id spécifique
            $sqlSoitTransmis = "SELECT * FROM soit_transmis WHERE id_soit_transmis = :id";

            $stmtSoitTransmis = $bdd->prepare($sqlSoitTransmis);
            $stmtSoitTransmis->bindParam(':id', $Id, PDO::PARAM_INT);
            $stmtSoitTransmis->execute();

            $soitTransmisData = $stmtSoitTransmis->fetch(PDO::FETCH_ASSOC);

            $bdd = null;

            header('Content-Type: application/json');
            echo json_encode(array(
                'soitTransmisData' => $soitTransmisData
            ));
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'Erreur lors de la récupération des données.'));
        }
    } else {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Identifiant non fourni.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès refusé.'));
}
?>
