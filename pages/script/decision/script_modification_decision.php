<?php
session_start();
include("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire de décision
        $id_decision = isset($_POST['id_decision']) ? $_POST['id_decision'] : null;
        $juridiction = isset($_POST['juridiction']) ? $_POST['juridiction'] : null;
        $type = isset($_POST['type']) ? $_POST['type'] : null;
        $desistement_irrecevabilite_prescription = isset($_POST['desistement_irrecevabilite_prescription']) ? ($_POST['desistement_irrecevabilite_prescription'] === 'true' ? 1 : 0) : null;
        $culpabilite = isset($_POST['culpabilite']) ? $_POST['culpabilite'] : null;
        $peine = isset($_POST['peine']) ? ($_POST['peine'] === 'true' ? 1 : 0) : null;
        $amende = isset($_POST['montant_amende']) ? $_POST['montant_amende'] : null;
        $peine_emprisonnement = isset($_POST['peine_emprisonnement']) ? $_POST['peine_emprisonnement'] : null;
        $remise_en_etat = isset($_POST['remise_en_etat']) ? ($_POST['remise_en_etat'] === 'true' ? 1 : 0) : null;
        $qualification_jugement = isset($_POST['qualification_jugement']) ? $_POST['qualification_jugement'] : null;
        $mode_signification = isset($_POST['mode_signification']) ? $_POST['mode_signification'] : null;
        $date_signification = isset($_POST['date_signification']) && $_POST['date_signification'] !== '' ? $_POST['date_signification'] : null;
        $date_decision = isset($_POST['date_decision']) && $_POST['date_decision'] !== '' ? $_POST['date_decision'] : null;
        $date_notification = isset($_POST['date_notification']) && $_POST['date_notification'] !== '' ? $_POST['date_notification'] : null;
        $observation = isset($_POST['observation']) ? $_POST['observation'] : null;
        $delai = isset($_POST['delai']) ? $_POST['delai'] : null;
        $montant_astreinte = isset($_POST['montant_astreinte']) ? $_POST['montant_astreinte'] : null;
        $publication = isset($_POST['publication']) ? ($_POST['publication'] === 'true' ? 1 : 0) : null;
        $condamnation_solidaire = isset($_POST['condamnation_solidaire']) ? ($_POST['condamnation_solidaire'] === 'true' ? 1 : 0) : null;
        $montant_sursis_amende = isset($_POST['montant_sursis_amende']) ? $_POST['montant_sursis_amende'] : null;
        $montant_sursis_prison = isset($_POST['montant_sursis_prison']) ? $_POST['montant_sursis_prison'] : null;
        $decision_reception = isset($_POST['reception']) ? ($_POST['reception'] === 'true' ? 1 : 0) : null;
        $id_audience = isset($_POST['audience']) ? $_POST['audience'] : null;
        $id_contrevenant = isset($_POST['contrevenant']) ? $_POST['contrevenant'] : null;


        // Afficher les variables transmises
error_log("id_decision: " . $id_decision);
error_log("juridiction: " . $juridiction);
error_log("type: " . $type);
error_log("desistement_irrecevabilite_prescription: " . $desistement_irrecevabilite_prescription);
error_log("culpabilite: " . $culpabilite);
error_log("peine: " . $peine);
error_log("amende: " . $amende);
error_log("peine_emprisonnement: " . $peine_emprisonnement);
error_log("remise_en_etat: " . $remise_en_etat);
error_log("qualification_jugement: " . $qualification_jugement);
error_log("mode_signification: " . $mode_signification);
error_log("date_signification: " . $date_signification);
error_log("date_decision: " . $date_decision);
error_log("date_notification: " . $date_notification);
error_log("observation: " . $observation);
error_log("delai: " . $delai);
error_log("montant_astreinte: " . $montant_astreinte);
error_log("publication: " . $publication);
error_log("condamnation_solidaire: " . $condamnation_solidaire);
error_log("montant_sursis_amende: " . $montant_sursis_amende);
error_log("montant_sursis_prison: " . $montant_sursis_prison);
error_log("decision_reception: " . $decision_reception);
error_log("id_audience: " . $id_audience);
error_log("id_contrevenant: " . $id_contrevenant);


        // Préparer la requête de mise à jour dans la table 'decisions'
        $sqlDecision = "UPDATE decisions SET 
            decision_juridiction = :juridiction, 
            decision_type = :type, 
            decision_procedure = :desistement_irrecevabilite_prescription, 
            decision_culpabilite = :culpabilite, 
            decision_peine = :peine, 
            decision_amende = :amende, 
            decision_peine_prison = :peine_emprisonnement, 
            decision_remise_etat = :remise_en_etat, 
            decision_qualification = :qualification_jugement, 
            decision_mode_signification = :mode_signification, 
            decision_date_signification = :date_signification, 
            decision_date_notification = :date_notification, 
            decision_date_decision = :date_decision, 
            decision_decision_receptionnee = :decision_reception, 
            decision_observation = :observation, 
            decision_delai = :delai, 
            decision_montant_astreinte = :montant_astreinte, 
            decision_publication = :publication, 
            decision_condamnation_solidaire = :condamnation_solidaire, 
            decision_sursis_amende = :montant_sursis_amende, 
            decision_sursis_prison = :montant_sursis_prison, 
            id_audience = :id_audience
        WHERE id_decision = :id_decision";

        // Préparation de la requête SQL
        $stmtDecision = $bdd->prepare($sqlDecision);

        // Liaison des paramètres
        $stmtDecision->bindParam(':juridiction', $juridiction);
        $stmtDecision->bindParam(':type', $type);
        $stmtDecision->bindParam(':desistement_irrecevabilite_prescription', $desistement_irrecevabilite_prescription);
        $stmtDecision->bindParam(':culpabilite', $culpabilite);
        $stmtDecision->bindParam(':peine', $peine);
        $stmtDecision->bindParam(':amende', $amende);
        $stmtDecision->bindParam(':peine_emprisonnement', $peine_emprisonnement);
        $stmtDecision->bindParam(':remise_en_etat', $remise_en_etat);
        $stmtDecision->bindParam(':qualification_jugement', $qualification_jugement);
        $stmtDecision->bindParam(':mode_signification', $mode_signification);
        $stmtDecision->bindParam(':date_signification', $date_signification);
        $stmtDecision->bindParam(':date_notification', $date_notification);
        $stmtDecision->bindParam(':date_decision', $date_decision);
        $stmtDecision->bindParam(':decision_reception', $decision_reception);
        $stmtDecision->bindParam(':observation', $observation);
        $stmtDecision->bindParam(':delai', $delai);
        $stmtDecision->bindParam(':montant_astreinte', $montant_astreinte);
        $stmtDecision->bindParam(':publication', $publication);
        $stmtDecision->bindParam(':condamnation_solidaire', $condamnation_solidaire);
        $stmtDecision->bindParam(':montant_sursis_amende', $montant_sursis_amende);
        $stmtDecision->bindParam(':montant_sursis_prison', $montant_sursis_prison);
        $stmtDecision->bindParam(':id_audience', $id_audience);
        $stmtDecision->bindParam(':id_decision', $id_decision);

        // Exécuter la requête de mise à jour dans la table 'decisions'
        $stmtDecision->execute();

        // Mettre à jour la table 'lien_contre_deci'
        $sqlLien = "UPDATE lien_contre_deci SET id_contrevenant = :id_contrevenant WHERE id_decision = :id_decision";

        // Préparation de la requête SQL
        $stmtLien = $bdd->prepare($sqlLien);

        // Liaison des paramètres
        $stmtLien->bindParam(':id_contrevenant', $id_contrevenant);
        $stmtLien->bindParam(':id_decision', $id_decision);

        // Exécuter la requête de mise à jour dans la table 'lien_contre_deci'
        $stmtLien->execute();

        // Fermer la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON avec le succès de l'opération
        header("Content-type: application/json");
        echo json_encode(array("success" => true));
    } catch (PDOException $e) {
        // En cas d'erreur, retourner une réponse JSON avec l'erreur
        header("Content-type: application/json");
        echo json_encode(array("error" => "Erreur lors de la mise à jour dans la base de données : " . $e->getMessage()));
    }
} else {
    // Si l'utilisateur n'est pas connecté en tant qu'admin, retourner une réponse JSON avec un message d'erreur d'accès non autorisé
    header("Content-type: application/json");
    echo json_encode(array("error" => "Accès non autorisé."));
}
?>
