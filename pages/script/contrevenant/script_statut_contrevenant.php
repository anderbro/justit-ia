<?php
session_start();
include("../../../bd.php");


try {
    $bdd = getBD();

    // Requête pour récupérer les statuts contrevenant
    $sql = "SELECT * FROM statut_contrevenant";

    $stmt = $bdd->prepare($sql);
    $stmt->execute();

    // Récupération des résultats
    $statuts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($statuts, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    // En cas d'erreur, affichage du message d'erreur
    die("Erreur : " . $e->getMessage());
}
?>