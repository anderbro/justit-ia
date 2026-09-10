<?php
session_start();
include ("../../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();
        $bdd->beginTransaction(); // Démarrer une transaction

        // Récupérer les données du formulaire d'infraction
        $pvDate = filter_input(INPUT_POST, 'pv_date', FILTER_SANITIZE_STRING);
        $pvReference = filter_input(INPUT_POST, 'pv_reference', FILTER_SANITIZE_STRING);
        $pvCorrespondant = filter_input(INPUT_POST, 'pv_correspondant', FILTER_SANITIZE_STRING);
        $pvContrevenant = filter_input(INPUT_POST, 'pv_contrevenant', FILTER_SANITIZE_STRING);
        $pvDetruit = filter_input(INPUT_POST, 'pv_detruit', FILTER_SANITIZE_STRING);
        $pvEnjeux = filter_input(INPUT_POST, 'pv_enjeux', FILTER_SANITIZE_STRING);
        $pvObs = filter_input(INPUT_POST, 'pv_obs', FILTER_SANITIZE_STRING);
        $pvType = filter_input(INPUT_POST, 'pv_type', FILTER_SANITIZE_STRING);
        $pvParcellePrin = filter_input(INPUT_POST, 'pv_parcelle_prin', FILTER_SANITIZE_STRING);
        $pvParcellesAutres = filter_input(INPUT_POST, 'pv_parcelles_autres', FILTER_SANITIZE_STRING);
        $pvZonage = filter_input(INPUT_POST, 'pv_zonage', FILTER_SANITIZE_STRING);
        $pvCommune = filter_input(INPUT_POST, 'pv_commune', FILTER_SANITIZE_STRING);
        $pvArrondissement = filter_input(INPUT_POST, 'pv_arrondissement', FILTER_SANITIZE_STRING);
        $pvCabanisation = filter_input(INPUT_POST, 'pv_cabanisation', FILTER_SANITIZE_STRING);
        $pvInfraObs = filter_input(INPUT_POST, 'pv_infra_obs', FILTER_SANITIZE_STRING);
        $idDossier = filter_input(INPUT_POST, 'id_dossier', FILTER_SANITIZE_NUMBER_INT);

        // Récupérer et traiter la chaîne de caractères pv_natinf en tableau
        $natinfString = filter_input(INPUT_POST, 'pv_natinf', FILTER_SANITIZE_STRING);
        $natinfValues = array_map('intval', explode(',', $natinfString));
        error_log("Valeurs de natinfValues : " . json_encode($natinfValues));
                // Construction de la requête SQL pour insérer l'infraction
        $sql = "INSERT INTO signalement_pv (pv_date, pv_reference, pv_correspondant, pv_contrevenant, pv_detruit, pv_enjeux, pv_commune, pv_obs, pv_type, pv_parcelle_prin, pv_parcelles_autres, pv_zonage, pv_cabanisation, pv_infra_obs, pv_arrondissement, id_dossier_1) 
        VALUES (:pv_date, :pv_reference, :pv_correspondant, :pv_contrevenant, :pv_detruit, :pv_enjeux, :pv_commune, :pv_obs, :pv_type, :pv_parcelle_prin, :pv_parcelles_autres, :pv_zonage, :pv_cabanisation, :pv_infra_obs, :pv_arrondissement, :id_dossier)";

        // Préparation de la requête SQL
        $stmt = $bdd->prepare($sql);

        // Liaison des paramètres
        $stmt->bindParam(':pv_date', $pvDate);
        $stmt->bindParam(':pv_reference', $pvReference);
        $stmt->bindParam(':pv_correspondant', $pvCorrespondant);
        $stmt->bindParam(':pv_contrevenant', $pvContrevenant);
        $stmt->bindParam(':pv_detruit', $pvDetruit);
        $stmt->bindParam(':pv_enjeux', $pvEnjeux);
        $stmt->bindParam(':pv_commune', $pvCommune);
        $stmt->bindParam(':pv_obs', $pvObs);
        $stmt->bindParam(':pv_type', $pvType);
        $stmt->bindParam(':pv_parcelle_prin', $pvParcellePrin);
        $stmt->bindParam(':pv_parcelles_autres', $pvParcellesAutres);
        $stmt->bindParam(':pv_zonage', $pvZonage);
        $stmt->bindParam(':pv_cabanisation', $pvCabanisation);
        $stmt->bindParam(':pv_infra_obs', $pvInfraObs);
        $stmt->bindParam(':pv_arrondissement', $pvArrondissement);
        $stmt->bindParam(':id_dossier', $idDossier);

        // Exécution de la requête
        $stmt->execute();

        // Récupérer l'ID de l'infraction nouvellement insérée
        $idInfraction = $bdd->lastInsertId();

        // Boucle pour insérer les associations entre l'infraction et les natinfs
        foreach ($natinfValues as $natinfValue) {
            $sqlInsertNatinfInfra = "INSERT INTO appartiens_natinf_infra (id_pv, id_natinf) VALUES (:idInfraction, :natinfValue)";
            $stmtInsertNatinfInfra = $bdd->prepare($sqlInsertNatinfInfra);
            $stmtInsertNatinfInfra->bindParam(':idInfraction', $idInfraction, PDO::PARAM_INT);
            $stmtInsertNatinfInfra->bindParam(':natinfValue', $natinfValue, PDO::PARAM_INT);
            $stmtInsertNatinfInfra->execute();
        }

        $bdd->commit(); // Valider la transaction

        // Fermeture de la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON indiquant le succès de l'opération et l'ID de l'infraction
        header('Content-Type: application/json');
        echo json_encode(array('success' => true, 'idInfraction' => $idInfraction));
    } catch (PDOException $e) {
        $bdd->rollBack(); // Annuler la transaction en cas d'erreur
        error_log("Erreur PDO : " . $e->getMessage());
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de l\'insertion de l\'infraction : ' . $e->getMessage()));
    } catch (Exception $e) {
        $bdd->rollBack(); // Annuler la transaction en cas d'erreur
        error_log("Erreur générale : " . $e->getMessage());
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de l\'insertion de l\'infraction : ' . $e->getMessage()));
    }
} else {
    // Retourner une réponse JSON si l'accès n'est pas autorisé
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>
