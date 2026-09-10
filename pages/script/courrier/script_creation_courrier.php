<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire de courrier
        $dateCourrier = isset($_POST['date_courrier']) ? $_POST['date_courrier'] : null;
        $typeDestinataire = isset($_POST['type_destinataire']) ? $_POST['type_destinataire'] : null;
        $destinataire = isset($_POST['destinataire']) ? $_POST['destinataire'] : null;
        $objetCourrier = isset($_POST['objet_courrier']) ? $_POST['objet_courrier'] : null;
        $observationsCourrier = isset($_POST['observations_courrier']) ? $_POST['observations_courrier'] : null;
        $idDossier = isset($_POST['id_dossier']) ? $_POST['id_dossier'] : null;

        // Valider les données du formulaire
        if (empty($dateCourrier) || empty($typeDestinataire) || empty($destinataire) || empty($objetCourrier)) {
            throw new Exception("Tous les champs obligatoires doivent être remplis.");
        }

        // Préparer la requête d'insertion dans la table 'courriers'
        $sqlCourrier = "INSERT INTO courrier (courrier_date, courrier_objet, courrier_observation, id, id_contrevenant, id_dossier) VALUES (:date_courrier, :objet_courrier, :observations_courrier, :id, :id_contrevenant, :id_dossier)";

        // Préparation de la requête SQL
        $stmtCourrier = $bdd->prepare($sqlCourrier);

        // Liaison des paramètres communs
        $stmtCourrier->bindParam(':date_courrier', $dateCourrier);
        $stmtCourrier->bindParam(':objet_courrier', $objetCourrier);
        $stmtCourrier->bindParam(':observations_courrier', $observationsCourrier);
        $stmtCourrier->bindParam(':id_dossier', $idDossier);

        // Liaison des paramètres spécifiques au destinataire
        if ($typeDestinataire == 'Agent') {
            $stmtCourrier->bindParam(':id', $destinataire);
            $stmtCourrier->bindValue(':id_contrevenant', null, PDO::PARAM_NULL);
        } else if ($typeDestinataire == 'Condamné') {
            $stmtCourrier->bindValue(':id', null, PDO::PARAM_NULL);
            $stmtCourrier->bindParam(':id_contrevenant', $destinataire);
        } else {
            throw new Exception("Type de destinataire invalide.");
        }

        // Exécuter la requête d'insertion dans la table 'courriers'
        $stmtCourrier->execute();

        // Retourner une réponse JSON avec le succès de l'opération
        header("Content-type: application/json");
        echo json_encode(array("status" => "success", "message" => "Courrier créé avec succès."));
    } catch (PDOException $e) {
        // En cas d'erreur, retourner une réponse JSON avec l'erreur
        header("Content-type: application/json");
        echo json_encode(array("status" => "error", "message" => "Erreur lors de l'insertion dans la base de données : " . $e->getMessage()));
    } catch (Exception $e) {
        // En cas d'erreur, retourner une réponse JSON avec l'erreur
        header("Content-type: application/json");
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }
} else {
    // Si l'utilisateur n'est pas connecté en tant qu'admin, retourner une réponse JSON avec un message d'erreur d'accès non autorisé
    header("Content-type: application/json");
    echo json_encode(array("status" => "error", "message" => "Accès non autorisé."));
}
?>