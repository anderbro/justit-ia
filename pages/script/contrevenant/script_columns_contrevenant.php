<?php
session_start();
include("../../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer les noms des colonnes de la table contrevenant
        $sql = "SHOW COLUMNS FROM contrevenant";
        $stmt = $bdd->prepare($sql);
        $stmt->execute();

        // Récupérer les résultats
        $result = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Fermer la connexion à la base de données
        $bdd = null;

        header('Content-Type: application/json');
        echo json_encode(array('columns' => $result));
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de la récupération des colonnes de la table contrevenant.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>