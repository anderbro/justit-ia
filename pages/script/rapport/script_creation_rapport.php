<?php
session_start();
include ("../../../bd.php");

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
        $data = json_decode(file_get_contents("php://input"), true);

        $dateRapport = $data['date_rapport'];
        $redacteurEmetteur = $data['redacteur_emetteur'];
        $autreRedacteur = $data['autre_redacteur'];
        $objetRapport = $data['objet_rapport'];
        $observationsRapport = $data['observations_rapport'];
        $idDossier = $data['id_dossier'];

        // Utiliser la valeur de $autreRedacteur si $redacteurEmetteur est "Autre"
        if ($redacteurEmetteur === "Autre") {
            $redacteurEmetteur = $autreRedacteur;
        }

        try {
            $bdd = getBD();

            $sql = "INSERT INTO rapport (rapport_date, rapport_emetteur, rapport_objet, rapport_observation, id_dossier) 
                    VALUES (:date_rapport, :redacteur_emetteur, :objet_rapport, :observations_rapport, :id_dossier)";
            $stmt = $bdd->prepare($sql);
            $stmt->bindParam(':date_rapport', $dateRapport);
            $stmt->bindParam(':redacteur_emetteur', $redacteurEmetteur);
            $stmt->bindParam(':objet_rapport', $objetRapport);
            $stmt->bindParam(':observations_rapport', $observationsRapport);
            $stmt->bindParam(':id_dossier', $idDossier);
            $stmt->execute();

            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur lors de la création du rapport : " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Accès non autorisé."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Méthode de requête non autorisée."]);
}
?>