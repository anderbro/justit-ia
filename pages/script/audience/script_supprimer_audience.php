<?php
session_start();
include ("../../../bd.php");

$bdd = getBD();
try {
    // Récupérer l'ID de l'audience depuis la requête GET
    $audienceId = isset($_GET['id']) ? $_GET['id'] : null;

    if ($audienceId !== null) {

        // Supprimer l'entrée correspondante dans la table appartiens_aud
        $stmt = $bdd->prepare("DELETE FROM appartiens_aud WHERE id_audience = :audienceId");
        $stmt->bindParam(':audienceId', $audienceId, PDO::PARAM_INT);
        $stmt->execute();

        // Supprimer l'entrée correspondante dans la table audience
        $stmtDeleteAudience = $bdd->prepare("DELETE FROM audience WHERE id_audience = :audienceId");
        $stmtDeleteAudience->bindParam(':audienceId', $audienceId, PDO::PARAM_INT);
        $stmtDeleteAudience->execute();

        // Retourner une réponse JSON indiquant le succès de l'opération
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de l\'audience manquant']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
} finally {
    // Fermer la connexion à la base de données
    $bdd = null;
}
?>