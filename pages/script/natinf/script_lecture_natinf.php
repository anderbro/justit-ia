<?php
include ("../../../bd.php");

try {
    $bdd = getBD();

    $sql = "SELECT * FROM natinf";
    $stmt = $bdd->query($sql);

    $natinf = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($natinf);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Erreur lors de la récupération des natinf.'));
}

// Fermer la connexion à la base de données
$bdd = null;
?>