<?php

include("../../bd.php");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['infraction_id']) && isset($_POST['dossier_id'])) {

    try {
        $bdd = getBD();

        $infractionId = $_POST['infraction_id']; // Correction du nom du paramètre
        $dossierId = $_POST['dossier_id']; // Correction du nom du paramètre

        // Effectuer une requête pour supprimer l'infraction
        $sql = "DELETE FROM signalement_pv WHERE id_pv = :infractionId AND id_dossier_1 = :dossierId ";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':infractionId', $infractionId, PDO::PARAM_INT);
        $stmt->bindParam(':dossierId', $dossierId, PDO::PARAM_INT);
        $stmt->execute();

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