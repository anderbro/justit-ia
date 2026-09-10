<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Requête SQL pour récupérer tous les enregistrements de la table parquet
        $sql = "SELECT * FROM parquet";

        // Préparation de la requête SQL
        $stmt = $bdd->prepare($sql);
        $stmt->execute();
        $parquets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fermer la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON avec les résultats récupérés
        header("Content-type: application/json");
        echo json_encode(array("success" => true, "parquets" => $parquets));
    } catch (PDOException $e) {
        // En cas d'erreur, retourner une réponse JSON avec l'erreur
        header("Content-type: application/json");
        echo json_encode(array("error" => "Erreur lors de la récupération des données : " . $e->getMessage()));
    }
} else {
    // Si l'utilisateur n'est pas connecté en tant qu'admin, retourner une réponse JSON avec un message d'erreur d'accès non autorisé
    header("Content-type: application/json");
    echo json_encode(array("error" => "Accès non autorisé."));
}
?>