<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        $dossierId = $_GET['id'];

        // Requête SQL pour récupérer les contrevenants liés à un dossier spécifique
        $sql = "SELECT c.*
                FROM contrevenant c
                INNER JOIN lien_contre_deci lcd ON c.id_contrevenant = lcd.id_contrevenant
                INNER JOIN decisions d ON lcd.id_decision = d.id_decision
                INNER JOIN audience a ON d.id_audience = a.id_audience
                INNER JOIN appartiens_aud aa ON a.id_audience = aa.id_audience
                INNER JOIN dossier dos ON aa.id_dossier = dos.id_dossier
                WHERE dos.id_dossier = :id_dossier;";

        // Préparation de la requête SQL
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':id_dossier', $dossierId, PDO::PARAM_INT);
        $stmt->execute();
        $contrevenants = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fermer la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON avec les résultats récupérés
        header("Content-type: application/json");
        echo json_encode(array("success" => true, "contrevenants" => $contrevenants));
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