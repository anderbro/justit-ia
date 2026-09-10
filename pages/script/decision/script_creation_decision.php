<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire de décision
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


        $id_audience = isset($_POST['audience']) ? $_POST['audience'] : null; // ou toute autre valeur par défaut souhaitée


        $id_contrevenant = isset($_POST['contrevenant']) ? $_POST['contrevenant'] : null; // ou toute autre valeur par défaut souhaitée



        // Préparer la requête d'insertion dans la table 'decision'
        $sqlDecision = "INSERT INTO `decisions`(
            `decision_juridiction`, 
            `decision_type`, 
            `decision_procedure`, 
            `decision_culpabilite`, 
            `decision_peine`, 
            `decision_amende`, 
            `decision_peine_prison`, 
            `decision_remise_etat`, 
            `decision_qualification`, 
            `decision_mode_signification`, 
            `decision_date_signification`, 
            `decision_date_notification`, 
            `decision_date_decision`,
            `decision_decision_receptionnee`, 
            `decision_observation`, 
            `decision_delai`, 
            `decision_montant_astreinte`, 
            `decision_publication`, 
            `decision_condamnation_solidaire`, 
            `decision_sursis_amende`, 
            `decision_sursis_prison`, 
            `id_audience`
        ) VALUES (
            :juridiction, 
            :type, 
            :desistement_irrecevabilite_prescription, 
            :culpabilite, 
            :peine, 
            :amende, 
            :peine_emprisonnement, 
            :remise_en_etat, 
            :qualification_jugement, 
            :mode_signification, 
            :date_signification, 
            :date_notification, 
            :date_decision,
            :decision_reception, 
            :observation, 
            :delai, 
            :montant_astreinte, 
            :publication, 
            :condamnation_solidaire, 
            :montant_sursis_amende, 
            :montant_sursis_prison, 
            :id_audience
        )";

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

        // Exécuter la requête d'
// Exécuter la requête d'insertion dans la table 'decision'
        $stmtDecision->execute();

        $id_decision = $bdd->lastInsertId();

        // Préparer la requête d'insertion dans la table 'lien_contre_deci'
        $sqlLien = "INSERT INTO `lien_contre_deci` (`id_contrevenant`, `id_decision`) VALUES (:id_contrevenant, :id_decision)";

        // Préparation de la requête SQL
        $stmtLien = $bdd->prepare($sqlLien);

        // Liaison des paramètres
        $stmtLien->bindParam(':id_contrevenant', $id_contrevenant);
        $stmtLien->bindParam(':id_decision', $id_decision);

        // Exécuter la requête d'insertion dans la table 'lien_contre_deci'
        $stmtLien->execute();

        // Fermer la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON avec le succès de l'opération
        header("Content-type: application/json");
        echo json_encode(array("success" => true));
    } catch (PDOException $e) {
        // En cas d'erreur, retourner une réponse JSON avec l'erreur
        header("Content-type: application/json");
        echo json_encode(array("error" => "Erreur lors de l'insertion dans la base de données : " . $e->getMessage()));
    }
} else {
    // Si l'utilisateur n'est pas connecté en tant qu'admin, retourner une réponse JSON avec un message d'erreur d'accès non autorisé
    header("Content-type: application/json");
    echo json_encode(array("error" => "Accès non autorisé."));
}
?>