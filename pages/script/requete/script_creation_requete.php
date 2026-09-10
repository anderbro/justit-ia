<?php
session_start();
include ("../../../bd.php");

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
        try {
            $bdd = getBD();

            // Récupération des données de la requête POST
            $dateRequete = isset($_POST['date_requete']) ? $_POST['date_requete'] : null;
            $objetRequete = isset($_POST['objet_requete']) ? $_POST['objet_requete'] : null;
            $redacteurEmetteur = isset($_POST['redacteur_emetteur']) ? $_POST['redacteur_emetteur'] : null;
            $observationsRequete = isset($_POST['observations_requete']) ? $_POST['observations_requete'] : null;
            $idDossier = isset($_POST['id_dossier']) ? $_POST['id_dossier'] : null;

            // Affichage des valeurs pour débogage
            error_log('Valeurs reçues : ' . var_export($_POST, true));

            $sql = "INSERT INTO requete (requete_date, requete_objet, requete_emetteur, requete_observation, id_dossier) 
                    VALUES (:date_requete, :objet_requete, :redacteur_emetteur, :observations_requete, :id_dossier)";
            $stmt = $bdd->prepare($sql);
            $stmt->bindParam(':date_requete', $dateRequete);
            $stmt->bindParam(':objet_requete', $objetRequete);
            $stmt->bindParam(':redacteur_emetteur', $redacteurEmetteur);
            $stmt->bindParam(':observations_requete', $observationsRequete);
            $stmt->bindParam(':id_dossier', $idDossier);

            if ($stmt->execute()) {
                $response = array('status' => 'success', 'message' => 'Requête créée avec succès');
            } else {
                $response = array('status' => 'error', 'message' => 'Erreur lors de la création de la requête');
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