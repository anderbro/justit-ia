<?php

session_start();
include("../../bd.php");

// Vérifier si les données nécessaires sont présentes
if (isset($_GET['contrevenantId']) && isset($_GET['dossierId'])) {

    $bdd = getBD();
    $contrevenantId = $_GET['contrevenantId'];
    $dossierId = $_GET['dossierId'];

    // Préparer la requête SQL d'insertion
    $sql = "INSERT INTO appartiens_dossier (id_contrevenant, id_dossier) VALUES (:contrevenantId, :dossierId)";

    // Log du code SQL (ajouté cette ligne)
    error_log("SQL: " . $sql);

    // Préparer et exécuter la requête avec des paramètres sécurisés
    $stmt = $bdd->prepare($sql);
    $stmt->bindParam(':contrevenantId', $contrevenantId, PDO::PARAM_INT);
    $stmt->bindParam(':dossierId', $dossierId, PDO::PARAM_INT);

    // Exécuter la requête
    if ($stmt->execute()) {
        // Retourner une réponse JSON avec succès
        echo json_encode(['success' => true]);
    } else {
        // Retourner une réponse JSON avec échec
        echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'insertion dans appartiens_dossier']);
    }
} else {
    // Retourner une réponse JSON si les données nécessaires sont absentes
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
}

?>