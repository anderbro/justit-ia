<?php
// script_suppression_contrevenant.php
session_start();
include("../../../bd.php");

$bdd = getBD();
try {
    // Récupérer l'ID du soit_transmis et l'ID du dossier depuis la requête GET
    $Id_soit_transmis = isset($_GET['id']) ? $_GET['id'] : null;
    $dossierId = isset($_GET['dossierId']) ? $_GET['dossierId'] : null;

    if ($Id_soit_transmis !== null && $dossierId !== null) {
        // Commencer une transaction
        $bdd->beginTransaction();

        // Supprimer l'entrée correspondante dans la table fait_objet
        $stmtFaitObjet = $bdd->prepare("DELETE FROM fais_objet WHERE id_soit_transmis = :Id_soit_transmis");
        $stmtFaitObjet->bindParam(':Id_soit_transmis', $Id_soit_transmis, PDO::PARAM_INT);
        $stmtFaitObjet->execute();

        // Supprimer l'entrée correspondante dans la table soit_transmis
        $stmtSoitTransmis = $bdd->prepare("DELETE FROM soit_transmis WHERE id_soit_transmis = :Id_soit_transmis AND id_dossier = :dossierId");
        $stmtSoitTransmis->bindParam(':Id_soit_transmis', $Id_soit_transmis, PDO::PARAM_INT);
        $stmtSoitTransmis->bindParam(':dossierId', $dossierId, PDO::PARAM_INT);
        $stmtSoitTransmis->execute();

        // Faut il supprimer tous les avis du liés au soit_transmis ????


        // Valider la transaction
        $bdd->commit();

        // Retourner une réponse JSON indiquant le succès de l'opération
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID du Soit_transmis ou ID du dossier manquant']);
    }
} catch (PDOException $e) {
    // En cas d'erreur, annuler la transaction
    if ($bdd->inTransaction()) {
        $bdd->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
} finally {
    // Fermer la connexion à la base de données
    $bdd = null;
}
?>
