<?php
session_start();
include ("../../../bd.php");

header("Content-Type: application/json");


if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        $idDossier = isset($_GET['id_dossier']) ? $_GET['id_dossier'] : null;

        $sql = "SELECT * FROM requete WHERE id_dossier = :id_dossier";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':id_dossier', $idDossier);
        $stmt->execute();

        $requetes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "requetes" => $requetes]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Erreur de base de données : " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Accès non autorisé"]);
}

?>