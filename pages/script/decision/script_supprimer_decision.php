<?php
session_start();
include ("../../../bd.php");

$bdd = getBD();

try {
    // Récupérer l'ID de la décision depuis la requête GET
    $decisionId = isset($_GET['id']) ? intval($_GET['id']) : null;

    if ($decisionId !== null) {

        // Supprimer l'entrée correspondante dans la table appartiens_decision (ou autre table liée si nécessaire)
        $stmt = $bdd->prepare("DELETE FROM lien_contre_deci WHERE id_decision = :decisionId");
        $stmt->bindParam(':decisionId', $decisionId, PDO::PARAM_INT);
        $stmt->execute();

        // Supprimer l'entrée correspondante dans la table decision
        $stmtDeleteDecision = $bdd->prepare("DELETE FROM decisions WHERE id_decision = :decisionId");
        $stmtDeleteDecision->bindParam(':decisionId', $decisionId, PDO::PARAM_INT);
        $stmtDeleteDecision->execute();

        // Retourner une réponse JSON indiquant le succès de l'opération
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de la décision manquant']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
} finally {
    // Fermer la connexion à la base de données
    $bdd = null;
}
?>