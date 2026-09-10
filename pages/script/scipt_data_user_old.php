<?php
include("../../bd.php");

if (isset($_GET['userId'])) {
    $userId = $_GET['userId'];



} else {
    // Si l'ID de l'utilisateur n'est pas présent dans la requête, renvoyez une réponse d'erreur
    header('Content-Type: application/json');
    echo json_encode(['error' => 'ID utilisateur non spécifié']);
}
?>