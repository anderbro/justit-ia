<?php

include ("../../../bd.php");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['infraction_id']) && isset($_POST['dossier_id'])) {

    try {
        $bdd = getBD();

        $infractionId = $_POST['infraction_id']; // Correction du nom du paramètre
        $dossierId = $_POST['dossier_id']; // Correction du nom du paramètre

        // Supprimer d'abord les entrées associées dans la table appartiens_natinf_infra
        $sqlDeleteChild = "DELETE FROM appartiens_natinf_infra WHERE id_pv = :infractionId";
        $stmtDeleteChild = $bdd->prepare($sqlDeleteChild);
        $stmtDeleteChild->bindParam(':infractionId', $infractionId, PDO::PARAM_INT);
        $stmtDeleteChild->execute();

        // Ensuite, supprimer l'infraction dans la table signalement_pv
        $sqlDeleteParent = "DELETE FROM signalement_pv WHERE id_pv = :infractionId AND id_dossier_1 = :dossierId";
        $stmtDeleteParent = $bdd->prepare($sqlDeleteParent);
        $stmtDeleteParent->bindParam(':infractionId', $infractionId, PDO::PARAM_INT);
        $stmtDeleteParent->bindParam(':dossierId', $dossierId, PDO::PARAM_INT);
        $stmtDeleteParent->execute();
        // Répondre avec succès
        header('Content-Type: application/json');
        echo json_encode(array('success' => true));

        exit();
    } catch (PDOException $e) {
        // Enregistrer l'erreur dans les logs avec la requête SQL et les valeurs
        error_log("Erreur lors de la suppression de l'infraction : " . $e->getMessage() . ". Requête SQL : " . $sql . ". Valeurs : infractionId = " . $infractionId . ", dossierId = " . $dossierId);

        // Répondre avec une erreur
        header('Content-Type: application/json');
        echo json_encode(array('success' => false, 'message' => 'Erreur lors de la suppression de l\'infraction.'));
    }
} else {
    // Répondre avec une erreur si les paramètres requis ne sont pas fournis
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'message' => 'Paramètres invalides.'));
}

?>