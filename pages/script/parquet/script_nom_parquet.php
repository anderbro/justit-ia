<?php
session_start();
include ("../../../bd.php");

$id_parquet = isset($_GET['id']) ? $_GET['id'] : null; // Utiliser $_GET['id'] pour récupérer l'ID

if ($id_parquet !== null) {
    try {
        $bdd = getBD();
        error_log("ID du parquet : " . $id_parquet);

        // Requête pour récupérer le nom du parquet en fonction de son ID
        $sql = "SELECT parquet FROM parquet
                WHERE id_parquet = :id_parquet";

        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':id_parquet', $id_parquet, PDO::PARAM_INT);
        $stmt->execute();

        $parquet = $stmt->fetch(PDO::FETCH_COLUMN);

        $bdd = null;

        header('Content-Type: application/json');
        echo json_encode(array('parquet' => $parquet)); // Retourner le nom du parquet
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de la récupération du nom du parquet.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'ID du parquet non fourni.'));
}
?>
