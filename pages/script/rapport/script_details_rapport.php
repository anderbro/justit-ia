<?php
session_start();
include ("../../../bd.php");

header("Content-Type: application/json");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();
        $sql = "SELECT * FROM rapport WHERE id_dossier = :id_dossier";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':id_dossier', $_GET['id_dossier']);
        $stmt->execute();
        $rapports = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "rapports" => $rapports]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur lors de la récupération des rapports : " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Accès non autorisé."]);
}
?>