<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        $dossierId = $_GET['id'];

        // Requête SQL pour récupérer les audiences liées à un dossier spécifique
        $sql = "SELECT a.* 
        FROM `audience` AS a
        JOIN `appartiens_aud` AS aa ON a.id_audience = aa.id_audience
        WHERE aa.id_dossier = :dossierId";

        // Préparation de la requête SQL
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':dossierId', $dossierId, PDO::PARAM_INT);

        // Exécuter la requête
        $stmt->execute();

        // Récupérer les résultats de la requête
        $audiences = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fermer la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON avec les audiences récupérées
        header("Content-type: application/json");
        echo json_encode(array("success" => true, "audiences" => $audiences));
    } catch (PDOException $e) {
        // En cas d'erreur, retourner une réponse JSON avec l'erreur
        header("Content-type: application/json");
        echo json_encode(array("error" => "Erreur lors de la récupération des audiences : " . $e->getMessage()));
    }
} else {
    // Si l'utilisateur n'est pas connecté en tant qu'admin, retourner une réponse JSON avec un message d'erreur d'accès non autorisé
    header("Content-type: application/json");
    echo json_encode(array("error" => "Accès non autorisé."));
}
?>