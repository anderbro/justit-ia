<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire d'audience
        $dateAudience = isset($_POST['date_audience']) ? $_POST['date_audience'] : null;
        $juridiction = isset($_POST['juridiction']) ? $_POST['juridiction'] : null;
        $typeProcedure = isset($_POST['type_procedure']) ? $_POST['type_procedure'] : null;
        $objetAudience = isset($_POST['objet_audience']) ? $_POST['objet_audience'] : null;
        $observationsAudience = isset($_POST['observations_audience']) ? $_POST['observations_audience'] : null;
        $suitesAudience = isset($_POST['suites_audience']) ? $_POST['suites_audience'] : null;
        $dateRenvoi = isset($_POST['date_renvoi']) ? $_POST['date_renvoi'] : null;
        $idDossier = isset($_POST['id_dossier']) ? $_POST['id_dossier'] : null; // Récupérer l'ID du dossier

        // Préparer la requête d'insertion dans la table 'audience'
        $sqlAudience = "INSERT INTO audience (audience_date, audience_juridiction, audience_type_proc, audience_objet, audience_observation, audience_suite, audience_date_renvoi) 
        VALUES (:date_audience, :juridiction, :type_procedure, :objet_audience, :observations_audience, :suites_audience, :date_renvoi)";

        // Préparation de la requête SQL
        $stmtAudience = $bdd->prepare($sqlAudience);

        // Liaison des paramètres
        $stmtAudience->bindParam(':date_audience', $dateAudience);
        $stmtAudience->bindParam(':juridiction', $juridiction);
        $stmtAudience->bindParam(':type_procedure', $typeProcedure);
        $stmtAudience->bindParam(':objet_audience', $objetAudience);
        $stmtAudience->bindParam(':observations_audience', $observationsAudience);
        $stmtAudience->bindParam(':suites_audience', $suitesAudience);
        $stmtAudience->bindParam(':date_renvoi', $dateRenvoi);

        // Exécuter la requête d'insertion dans la table 'audience'
        $stmtAudience->execute();

        // Récupérer l'ID de l'audience nouvellement insérée
        $idAudience = $bdd->lastInsertId();

        // Préparer la requête d'insertion dans la table 'appartiens_aud'
        $sqlAppartiensAud = "INSERT INTO appartiens_aud (id_dossier, id_audience) VALUES (:id_dossier, :id_audience)";

        // Préparation de la requête SQL
        $stmtAppartiensAud = $bdd->prepare($sqlAppartiensAud);

        // Liaison des paramètres
        $stmtAppartiensAud->bindParam(':id_dossier', $idDossier);
        $stmtAppartiensAud->bindParam(':id_audience', $idAudience);

        // Exécuter la requête d'insertion dans la table 'appartiens_aud'
        $stmtAppartiensAud->execute();

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