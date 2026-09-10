<?php
session_start();
include("../../bd.php");

$Id = isset($_GET['id']) ? $_GET['id'] : null;

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    if ($Id !== null) {
        try {
            $bdd = getBD();

            // Requête pour récupérer les contrevenants liés à un dossier
            $sql = "SELECT c.*, alc.id_statut_contrevenant 
            FROM contrevenant AS c 
            JOIN appartiens_dossier AS ad ON c.id_contrevenant = ad.id_contrevenant 
            LEFT JOIN a_le_statut_con AS alc ON c.id_contrevenant = alc.id_contrevenant 
            WHERE ad.id_dossier = :Id";

            $stmt = $bdd->prepare($sql);
            $stmt->bindParam(':Id', $Id, PDO::PARAM_INT);
            $stmt->execute();

            $contrevenants = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $bdd = null;

            header('Content-Type: application/json');
            echo json_encode(array('contrevenants' => $contrevenants));
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'Erreur lors de la récupération des contrevenants.'));
        }
    } else {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Identifiant non fourni.'));
    }
}
?>
