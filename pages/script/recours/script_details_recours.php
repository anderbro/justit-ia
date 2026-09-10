<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer l'id du dossier depuis les paramètres GET
        $dossierId = $_GET['id'];

        // Requête SQL pour récupérer les recours liés à un dossier spécifique
        $sql = "SELECT r.recours_date, r.recours_type, r.id_contrevenant, r.id_parquet, r.recours_observation,
        c.nom AS contrevenant_nom, c.prenom AS contrevenant_prenom,
        p.parquet AS nom_parquet
 FROM recours r
 INNER JOIN lien_recours_deci lrd ON r.id_recours = lrd.id_recours
 INNER JOIN decisions d ON lrd.id_decision = d.id_decision
 INNER JOIN audience a ON d.id_audience = a.id_audience
 INNER JOIN appartiens_aud aa ON a.id_audience = aa.id_audience
 LEFT JOIN contrevenant c ON r.id_contrevenant = c.id_contrevenant
 LEFT JOIN parquet p ON r.id_parquet = p.id_parquet
 WHERE aa.id_dossier = :id_dossier";

        // Préparation de la requête SQL
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':id_dossier', $dossierId, PDO::PARAM_INT);

        // Exécuter la requête
        $stmt->execute();

        // Récupérer les résultats de la requête
        $recours = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fermer la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON avec les recours récupérés
        header("Content-type: application/json");
        echo json_encode(array("success" => true, "recours" => $recours));
    } catch (PDOException $e) {
        // En cas d'erreur, retourner une réponse JSON avec l'erreur
        header("Content-type: application/json");
        echo json_encode(array("error" => "Erreur lors de la récupération des recours : " . $e->getMessage()));
    }
} else {
    // Si l'utilisateur n'est pas connecté en tant qu'admin, retourner une réponse JSON avec un message d'erreur d'accès non autorisé
    header("Content-type: application/json");
    echo json_encode(array("error" => "Accès non autorisé."));
}
?>