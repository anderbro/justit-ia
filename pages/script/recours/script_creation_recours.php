<?php
session_start();
include ("../../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        $decisionId = isset($_POST['decision']) ? $_POST['decision'] : null;
        $dateRecours = isset($_POST['date']) ? $_POST['date'] : null;
        $auteur = isset($_POST['auteur']) ? $_POST['auteur'] : null;

        // Affichage de la valeur de $auteur dans les logs d'erreur
        error_log('Valeur de $auteur : ' . var_export($auteur, true));

        $typeRecours = isset($_POST['type']) ? $_POST['type'] : null;
        $observations = isset($_POST['observations']) ? $_POST['observations'] : null;

        if (strpos($auteur, 'contrevenant-') === 0) {
            $auteurId = str_replace('contrevenant-', '', $auteur);
            $auteurType = 'contrevenant';
        } elseif (strpos($auteur, 'parquet-') === 0) {
            $auteurId = str_replace('parquet-', '', $auteur);
            $auteurType = 'parquet';
        } else {
            $auteurId = null;
            $auteurType = null;
        }

        if ($auteurType === 'contrevenant') {
            $sqlRecours = "INSERT INTO recours (recours_date, id_contrevenant, recours_type, recours_observation) VALUES (:date_recours, :auteur, :type_recours, :observations)";
        } else {
            $sqlRecours = "INSERT INTO recours (recours_date, id_parquet, recours_type, recours_observation) VALUES (:date_recours, :auteur, :type_recours, :observations)";
        }

        $stmt = $bdd->prepare($sqlRecours);
        $stmt->bindParam(':date_recours', $dateRecours);
        $stmt->bindParam(':auteur', $auteurId);
        $stmt->bindParam(':type_recours', $typeRecours);
        $stmt->bindParam(':observations', $observations);

        if ($stmt->execute()) {
            $recoursId = $bdd->lastInsertId();

            $sqlLien = "INSERT INTO lien_recours_deci (id_recours, id_decision) VALUES (:recours_id, :decision_id)";
            $stmtLien = $bdd->prepare($sqlLien);
            $stmtLien->bindParam(':recours_id', $recoursId);
            $stmtLien->bindParam(':decision_id', $decisionId);

            if ($stmtLien->execute()) {
                $response = array('status' => 'success', 'message' => 'Recours créé avec succès');
            } else {
                $response = array('status' => 'error', 'message' => 'Erreur lors de la création du lien entre le recours et la décision');
            }
        } else {
            $response = array('status' => 'error', 'message' => 'Erreur lors de la création du recours');
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
?>