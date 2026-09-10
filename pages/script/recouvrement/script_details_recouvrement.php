<?php
session_start();
include ("../../../bd.php");

header("Content-Type: application/json");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();
        $sql = "SELECT r.*, 
        CONCAT(a.agent_nom, IF(a.agent_prenom IS NOT NULL, CONCAT(' ', a.agent_prenom), '')) AS recouvrement_agent,
        CONCAT(c.nom, IF(c.prenom IS NOT NULL, CONCAT(' ', c.prenom), '')) AS recouvrement_contrevenant
        FROM recouvrement r
        LEFT JOIN agent a ON r.id = a.id
        LEFT JOIN contrevenant c ON r.id_contrevenant = c.id_contrevenant
        WHERE r.id_dossier = :id_dossier";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':id_dossier', $_GET['id_dossier']);
        $stmt->execute();
        $recouvrements = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "recouvrements" => $recouvrements]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur lors de la récupération des recouvrements : " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Accès non autorisé."]);
}
?>