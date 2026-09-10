<?php
session_start();
include("../../../bd.php");


// error_log('ID reçu depuis l\'URL : ' . $Id);

$Id = isset($_GET['id']) ? $_GET['id'] : null;

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    if ($Id !== null) {
        try {
            $bdd = getBD();

            // Requête pour récupérer les contrevenants liés à un dossier
            $sql = "SELECT c.*, s.nom_statut_contrevenant 
            FROM contrevenant AS c JOIN appartiens_dossier AS ad ON c.id_contrevenant = ad.id_contrevenant 
            LEFT JOIN a_le_statut_con AS alc ON c.id_contrevenant = alc.id_contrevenant 
            LEFT JOIN statut_contrevenant AS s ON alc.id_statut_contrevenant = s.id_statut_contrevenant
             WHERE ad.id_dossier = :Id";

            // error_log('Avant la requête SQL');

            $stmt = $bdd->prepare($sql);
            $stmt->bindParam(':Id', $Id, PDO::PARAM_INT);
            $stmt->execute();

            $contrevenants = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $bdd = null;

            // error_log('Résultat de $contrevenants:');
            // error_log(print_r($contrevenants, true));

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