<?php
// Inclure le fichier de connexion à la base de données
include("../../bd.php");

// Vérifier si l'identifiant de la commune a été fourni dans la requête
if (isset($_GET['communeId'])) {
    // Récupérer l'identifiant de la commune depuis la requête
    $communeId = $_GET['communeId'];

    // Connexion à la base de données
    $bdd = getBD();

    // Requête SQL pour récupérer l'arrondissement de la commune spécifiée
    $sql = "SELECT arrondissement FROM `comm_arr` WHERE id_comm = :communeId";
    $stmt = $bdd->prepare($sql);
    $stmt->bindParam(':communeId', $communeId);
    $stmt->execute();

    // Récupérer les données de l'arrondissement
    $arrondissement = $stmt->fetchColumn();

    // Renvoyer les données de l'arrondissement au format JSON
    header('Content-Type: application/json');
    echo json_encode(['arrondissement' => $arrondissement]);
} else {
    // Si l'identifiant de la commune n'a pas été fourni, renvoyer une erreur
    http_response_code(400);
    echo json_encode(['error' => 'Identifiant de commune non fourni']);
}
?>