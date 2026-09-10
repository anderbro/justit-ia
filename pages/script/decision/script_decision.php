<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        $dossierId = $_GET['id'];

        // Requête SQL pour récupérer les decisions liées à un dossier spécifique
        $sql = "SELECT d.*, c.*
        FROM decisions d
        INNER JOIN audience a ON d.id_audience = a.id_audience
        INNER JOIN appartiens_aud aa ON a.id_audience = aa.id_audience
        INNER JOIN dossier dos ON aa.id_dossier = dos.id_dossier
        LEFT JOIN lien_contre_deci lcd ON d.id_decision = lcd.id_decision
        LEFT JOIN contrevenant c ON lcd.id_contrevenant = c.id_contrevenant
        WHERE dos.id_dossier = :id_dossier";

        // Préparation de la requête SQL
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':id_dossier', $dossierId, PDO::PARAM_INT); // Correction ici

        // Exécuter la requête
        $stmt->execute();

        // Récupérer les résultats de la requête
        $decisions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fermer la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON avec les décisions récupérées
        header("Content-type: application/json");
        echo json_encode(array("success" => true, "decisions" => $decisions));
    } catch (PDOException $e) {
        // En cas d'erreur, retourner une réponse JSON avec l'erreur
        header("Content-type: application/json");
        echo json_encode(array("error" => "Erreur lors de la récupération des décisions : " . $e->getMessage()));
    }
} else {
    // Si l'utilisateur n'est pas connecté en tant qu'admin, retourner une réponse JSON avec un message d'erreur d'accès non autorisé
    header("Content-type: application/json");
    echo json_encode(array("error" => "Accès non autorisé."));
}
?>