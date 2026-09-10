<?php
session_start();
include("../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire d'infraction
        $pvDate = isset($_POST['pv_date']) ? $_POST['pv_date'] : null;
        $pvReference = isset($_POST['pv_reference']) ? $_POST['pv_reference'] : null;
        $pvCorrespondant = isset($_POST['pv_correspondant']) ? $_POST['pv_correspondant'] : null;
        $pvContrevenant = isset($_POST['pv_contrevenant']) ? $_POST['pv_contrevenant'] : null;
        $pvDetruit = isset($_POST['pv_detruit']) ? $_POST['pv_detruit'] : null;
        $pvEnjeux = isset($_POST['pv_enjeux']) ? $_POST['pv_enjeux'] : null;
        $pvObs = isset($_POST['pv_obs']) ? $_POST['pv_obs'] : null;
        $pvType = isset($_POST['pv_type']) ? $_POST['pv_type'] : null;
        $pvParcellePrin = isset($_POST['pv_parcelle_prin']) ? $_POST['pv_parcelle_prin'] : null;
        $pvParcellesAutres = isset($_POST['pv_parcelles_autres']) ? $_POST['pv_parcelles_autres'] : null;
        $pvZone = isset($_POST['pv_zone']) ? $_POST['pv_zone'] : null;
        $pvCabanisation = isset($_POST['pv_cabanisation']) ? $_POST['pv_cabanisation'] : null;
        $pvInfraObs = isset($_POST['pv_infra_obs']) ? $_POST['pv_infra_obs'] : null;

        // Récupérer l'ID du dossier depuis la requête POST
        $idDossier = isset($_POST['id_dossier']) ? $_POST['id_dossier'] : null;

        // // Validation des données (à adapter selon vos besoins)
        // if (!$pvDate || !$pvReference || !$pvCorrespondant || !$pvContrevenant || !$idDossier) {
        //     // Retourner une réponse d'erreur si des données sont manquantes
        //     header('Content-Type: application/json');
        //     echo json_encode(array('error' => 'Champs manquants.'));
        //     exit();
        // }

        // Construction de la requête SQL pour insérer l'infraction
        $sql = "INSERT INTO signalement_pv (pv_date, pv_reference, pv_correspondant, pv_contrevenant, pv_detruit, pv_enjeux, pv_obs, pv_type, pv_parcelle_prin, pv_parcelles_autres, pv_zone, pv_cabanisation, pv_infra_obs, id_dossier_1) 
        VALUES (:pv_date, :pv_reference, :pv_correspondant, :pv_contrevenant, :pv_detruit, :pv_enjeux, :pv_obs, :pv_type, :pv_parcelle_prin, :pv_parcelles_autres, :pv_zone, :pv_cabanisation, :pv_infra_obs, :id_dossier)";

        // Préparation de la requête SQL
        $stmt = $bdd->prepare($sql);

        // Liaison des paramètres
        $stmt->bindParam(':pv_date', $pvDate);
        $stmt->bindParam(':pv_reference', $pvReference);
        $stmt->bindParam(':pv_correspondant', $pvCorrespondant);
        $stmt->bindParam(':pv_contrevenant', $pvContrevenant);
        $stmt->bindParam(':pv_detruit', $pvDetruit);
        $stmt->bindParam(':pv_enjeux', $pvEnjeux);
        $stmt->bindParam(':pv_obs', $pvObs);
        $stmt->bindParam(':pv_type', $pvType);
        $stmt->bindParam(':pv_parcelle_prin', $pvParcellePrin);
        $stmt->bindParam(':pv_parcelles_autres', $pvParcellesAutres);
        $stmt->bindParam(':pv_zone', $pvZone);
        $stmt->bindParam(':pv_cabanisation', $pvCabanisation);
        $stmt->bindParam(':pv_infra_obs', $pvInfraObs);
        $stmt->bindParam(':id_dossier', $idDossier);


        // Exécution de la requête
        $stmt->execute();

        // Affichage du résultat de la requête finale dans les logs
        $errorInfo = $stmt->errorInfo();
        if ($errorInfo[0] !== '00000') {
            error_log("Erreur lors de l'exécution de la requête : " . json_encode($errorInfo));
        } else {
            error_log("Requête exécutée avec succès.");
        }
        // Récupérer l'ID de l'infraction nouvellement insérée
        $idInfraction = $bdd->lastInsertId();

        // Fermeture de la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON indiquant le succès de l'opération et l'ID de l'infraction
        header('Content-Type: application/json');
        echo json_encode(array('success' => true, 'idInfraction' => $idInfraction));
    } catch (PDOException $e) {
        // En cas d'erreur, retourner une réponse JSON avec un message d'erreur
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de l\'insertion de l\'infraction : ' . $e->getMessage()));
    }
} else {
    // Retourner une réponse JSON si l'accès n'est pas autorisé
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>