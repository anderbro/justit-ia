<?php
session_start();
include("../../bd.php");

try {
    $bdd = getBD();

    // Requête pour récupérer les statuts contrevenant
    $sql = "SELECT * FROM statut_contrevenant";

    $stmt = $bdd->prepare($sql);
    $stmt->execute();

    // Récupération des résultats
    $statuts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Conversion en format JSON
    $json = json_encode($statuts);

    // Affichage du résultat
    header('Content-Type: application/json');
    echo $json;
} catch (PDOException $e) {
    // En cas d'erreur, affichage du message d'erreur
    die("Erreur : " . $e->getMessage());
}
?>