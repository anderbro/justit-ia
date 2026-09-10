<?php
// script_suppression_contrevenant.php
session_start();
include("../../../bd.php");

$bdd = getBD();
try {
    // Récupérer l'ID du soit_transmis depuis la requête GET
    $Id_avis = isset($_GET['id']) ? $_GET['id'] : null;

    if ($Id_avis !== null) {
        // Commencer une transaction
        $bdd->beginTransaction();

        // Supprimer l'entrée correspondante dans la table fais_objet
        $stmtFaitObjet = $bdd->prepare("DELETE FROM fais_objet WHERE id_avis = :Id_avis");
        $stmtFaitObjet->bindParam(':Id_avis', $Id_avis, PDO::PARAM_INT);
        $stmtFaitObjet->execute();

        // Supprimer l'entrée correspondante dans la table avis
        $stmtSoitTransmis = $bdd->prepare("DELETE FROM avis WHERE id_avis = :Id_avis");
        $stmtSoitTransmis->bindParam(':Id_avis', $Id_avis, PDO::PARAM_INT);
        $stmtSoitTransmis->execute();

        // Valider la transaction
        $bdd->commit();

        // Retourner une réponse JSON indiquant le succès de l'opération
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => "ID de l'avis manquant"]);
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
