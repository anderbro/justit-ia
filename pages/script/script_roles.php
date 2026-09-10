<?php
include("../../bd.php");

try {
    $bdd = getBD();

    $sql = "SELECT * FROM role";
    $stmt = $bdd->query($sql);

    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($roles);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Erreur lors de la récupération des rôles.'));
}

// Fermer la connexion à la base de données
$bdd = null;
?>