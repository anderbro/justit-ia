<?php
session_start();
include ("../../../bd.php");
$nom_parquet = isset($_GET['parquet']) ? $_GET['parquet'] : null;

if ($nom_parquet !== null) {
    try {
        $bdd = getBD();
        error_log("nom parquet : ",$nom_parquet);

        // Requête pour récupérer l'id_parquet en fonction du nom du parquet
        $sql = "SELECT id_parquet
                FROM parquet
                WHERE parquet = $nom_parquet";

        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':nom_parquet', $nom_parquet, PDO::PARAM_STR);
        $stmt->execute();

        $id_parquet = $stmt->fetch(PDO::FETCH_COLUMN);

        $bdd = null;

        header('Content-Type: application/json');
        echo json_encode(array('id_parquet' => $id_parquet));
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de la récupération de l\'id_parquet.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Nom du parquet non fourni.'));
}
