<?php

session_start();
include("../../bd.php");

try {
    $bdd = getBD();
    // Assurez-vous de récupérer les paramètres et les données de la requête
    // $type = $_GET['type'];
    $contrevenantId = $_POST['contrevenantId'];



    // Construire la requête SQL
    $query = "UPDATE contrevenant SET $columns=$champs WHERE id_contrevenant = :id";
    $stmt = $pdo->prepare($query);



    $stmt->bindParam(':id', $contrevenantId);

    $stmt->execute();

    // Répondre avec un résultat (vous pouvez ajuster cela en fonction de vos besoins)
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // En cas d'erreur, renvoyer une réponse d'échec avec un message d'erreur
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>