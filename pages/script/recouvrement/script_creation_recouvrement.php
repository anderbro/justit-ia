<?php
session_start();
include ("../../../bd.php");

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
        try {
            $bdd = getBD();

            // Récupération des données de la requête POST
            $dateRecouvrement = isset($_POST['date_recouvrement']) ? $_POST['date_recouvrement'] : null;
            $agentRecouvrement = isset($_POST['agent_recouvrement']) ? $_POST['agent_recouvrement'] : null;
            $objetRecouvrement = isset($_POST['objet_recouvrement']) ? $_POST['objet_recouvrement'] : null;
            $personneVisee = isset($_POST['personne_visee']) ? $_POST['personne_visee'] : null;
            $dateDebut = isset($_POST['date_debut']) ? $_POST['date_debut'] : null;
            $dateFin = isset($_POST['date_fin']) ? $_POST['date_fin'] : null;
            $montantJournalier = isset($_POST['montant_journalier']) ? $_POST['montant_journalier'] : null;
            $montantTotal = isset($_POST['montant_total']) ? $_POST['montant_total'] : null;
            $fondementAnnulation = isset($_POST['fondement_annulation']) ? $_POST['fondement_annulation'] : null;
            $observationsRecouvrement = isset($_POST['observations_recouvrement']) ? $_POST['observations_recouvrement'] : null;
            $idDossier = isset($_POST['dossier_id']) ? $_POST['dossier_id'] : null;

            // Affichage des valeurs pour débogage
            error_log('Valeurs reçues : ' . var_export($_POST, true));

            // Préparation de la requête SQL pour insérer le recouvrement
            $sql = "INSERT INTO recouvrement (recouvrement_date, id, recouvrement_objet, id_contrevenant, recouvrement_date_periode_debut, recouvrement_date_periode_fin,  recouvrement_montant_journalier, recouvrement_montant_total, recouvrement_annulation, recouvrement_observation, id_dossier) 
                    VALUES (:date_recouvrement, :agent_recouvrement, :objet_recouvrement, :personne_visee, :date_debut, :date_fin,:montant_journalier, :montant_total, :fondement_annulation, :observations_recouvrement, :id_dossier)";
            $stmt = $bdd->prepare($sql);
            $stmt->bindParam(':date_recouvrement', $dateRecouvrement);
            $stmt->bindParam(':agent_recouvrement', $agentRecouvrement);
            $stmt->bindParam(':objet_recouvrement', $objetRecouvrement);
            $stmt->bindParam(':personne_visee', $personneVisee);
            $stmt->bindParam(':date_debut', $dateDebut);
            $stmt->bindParam(':date_fin', $dateFin);
            $stmt->bindParam(':montant_journalier', $montantJournalier);
            $stmt->bindParam(':montant_total', $montantTotal);
            $stmt->bindParam(':fondement_annulation', $fondementAnnulation);
            $stmt->bindParam(':observations_recouvrement', $observationsRecouvrement);
            $stmt->bindParam(':id_dossier', $idDossier);

            if ($stmt->execute()) {
                $response = array('status' => 'success', 'message' => 'Recouvrement créé avec succès');
            } else {
                $response = array('status' => 'error', 'message' => 'Erreur lors de la création du recouvrement');
            }

            echo json_encode($response);
        } catch (PDOException $e) {
            $response = array('status' => 'error', 'message' => 'Erreur de base de données : ' . $e->getMessage());
            echo json_encode($response);
        }
    } else {
        $response = array('status' => 'error', 'message' => 'Accès non autorisé');
        echo json_encode($response);
    }
} else {
    $response = array('status' => 'error', 'message' => 'Méthode de requête non autorisée');
    echo json_encode($response);
}
?>