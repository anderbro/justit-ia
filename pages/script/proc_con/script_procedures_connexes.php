<?php
session_start();
include("../../../bd.php");

// Connexion à la base de données
try {
    $conn = getBD();
} catch (PDOException $e) {
    // Gérer les erreurs de connexion
    die("Erreur de connexion à la base de données : " . $e->getMessage());
}

// Requête pour récupérer les procédures connexes
$sql = "SELECT * FROM proc_connexes";
$result = $conn->query($sql);

// Création d'un tableau associatif pour stocker les données
$data = array();
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    $data[] = $row;
}

// Conversion du tableau associatif en format JSON
echo json_encode($data);

// Fermeture de la connexion
$conn = null;
?>