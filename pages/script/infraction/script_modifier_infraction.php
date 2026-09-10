<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté et a les droits nécessaires
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();
        $bdd->beginTransaction();

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
        $idInfraction = filter_input(INPUT_POST, 'id_pv', FILTER_VALIDATE_INT);

        // Récupérer et traiter la chaîne de caractères pv_natinf en tableau
        $natinfString = filter_input(INPUT_POST, 'pv_natinf', FILTER_SANITIZE_STRING);
        $natinfValues = array_map('intval', explode(',', $natinfString));
        error_log("Valeurs de natinfValues : " . json_encode($natinfValues));

        // Validation des entrées
        if (!$idInfraction) {
            throw new Exception("ID de l'infraction manquant.");
        }

        // Mise à jour des détails de l'infraction
        $sql = "UPDATE signalement_pv 
                SET pv_date = :pv_date, pv_reference = :pv_reference, pv_correspondant = :pv_correspondant, 
                    pv_contrevenant = :pv_contrevenant, pv_detruit = :pv_detruit, pv_enjeux = :pv_enjeux, 
                    pv_commune = :pv_commune, pv_obs = :pv_obs, pv_type = :pv_type, pv_parcelle_prin = :pv_parcelle_prin, 
                    pv_parcelles_autres = :pv_parcelles_autres, pv_zonage = :pv_zonage, pv_cabanisation = :pv_cabanisation, 
                    pv_infra_obs = :pv_infra_obs, pv_arrondissement = :pv_arrondissement 
                WHERE id_pv = :id_infraction";

        $stmt = $bdd->prepare($sql);
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
        $stmt->bindParam(':id_infraction', $idInfraction);
        $stmt->execute();

        // Supprimer les anciennes associations dans appartiens_natinf_infra
        $sqlDeleteNatinfInfra = "DELETE FROM appartiens_natinf_infra WHERE id_pv = :idInfraction";
        $stmtDeleteNatinfInfra = $bdd->prepare($sqlDeleteNatinfInfra);
        $stmtDeleteNatinfInfra->bindParam(':idInfraction', $idInfraction);
        $stmtDeleteNatinfInfra->execute();

        // Insérer les nouvelles associations entre l'infraction et les natinf
        $sqlInsertNatinfInfra = "INSERT INTO appartiens_natinf_infra (id_pv, id_natinf) VALUES (:idInfraction, :natinfValue)";
        $stmtInsertNatinfInfra = $bdd->prepare($sqlInsertNatinfInfra);

        foreach ($natinfValues as $natinfValue) {
            if (!empty($natinfValue)) {
                $stmtInsertNatinfInfra->bindParam(':idInfraction', $idInfraction);
                $stmtInsertNatinfInfra->bindParam(':natinfValue', $natinfValue);
                $stmtInsertNatinfInfra->execute();
            }
        }

        $bdd->commit();

        header('Content-Type: application/json');
        echo json_encode(array('success' => true, 'idInfraction' => $idInfraction));
    } catch (PDOException $e) {
        $bdd->rollBack();
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de la mise à jour de l\'infraction : ' . $e->getMessage()));
    } catch (Exception $e) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur : ' . $e->getMessage()));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>
