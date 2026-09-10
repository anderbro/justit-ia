<?php
// script_suppression_contrevenant.php
session_start();
include("../../bd.php");
$bdd = getBD();
try {
    // Récupérer l'ID du contrevenant et l'ID du dossier depuis la requête GET
    $contrevenantId = isset($_GET['id']) ? $_GET['id'] : null;
    $dossierId = isset($_GET['dossierId']) ? $_GET['dossierId'] : null;

    if ($contrevenantId !== null && $dossierId !== null) {

        // Supprimer l'entrée correspondante dans la table appartiens_dossier
        $stmt = $bdd->prepare("DELETE FROM appartiens_dossier WHERE id_contrevenant = :contrevenantId AND id_dossier = :dossierId");
        $stmt->bindParam(':contrevenantId', $contrevenantId, PDO::PARAM_INT);
        $stmt->bindParam(':dossierId', $dossierId, PDO::PARAM_INT);
        $stmt->execute();

        // Supprimer l'entrée correspondante dans la table a_le_statut_con
        $stmtDeleteStatut = $bdd->prepare("DELETE FROM a_le_statut_con WHERE id_contrevenant = :contrevenantId AND id_dossier = :dossierId");
        $stmtDeleteStatut->bindParam(':contrevenantId', $contrevenantId, PDO::PARAM_INT);
        $stmtDeleteStatut->bindParam(':dossierId', $dossierId, PDO::PARAM_INT);
        $stmtDeleteStatut->execute();

        // Retourner une réponse JSON indiquant le succès de l'opération
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID du contrevenant ou ID du dossier manquant']);
    }



} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
} finally {
    // Fermer la connexion à la base de données
    $bdd = null;
}
?>