<?php
// Inclure le fichier de connexion à la base de données
include("../../bd.php");

// Connexion à la base de données
$bdd = getBD();

// Requête SQL pour récupérer les communes
$sql = "SELECT * FROM `comm_arr` ORDER BY `comm_arr`.`commune` ASC";
$stmt = $bdd->prepare($sql);
$stmt->execute();
$communes = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Renvoyer les communes au format JSON
header('Content-Type: application/json');
echo json_encode($communes);
?>