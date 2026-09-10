<?php
session_start();
include("../../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire d'infraction
        $date_audience = isset($_POST['date_audience']) ? $_POST['date_audience'] : null;
        $juridiction = isset($_POST['juridiction']) ? $_POST['juridiction'] : null;
        $type_procedure = isset($_POST['type_procedure']) ? $_POST['type_procedure'] : null;
        $objet_audience = isset($_POST['objet_audience']) ? $_POST['objet_audience'] : null;
        $observations_audience = isset($_POST['observations_audience']) ? $_POST['observations_audience'] : null;
        $suites_audience = isset($_POST['suites_audience']) ? $_POST['suites_audience'] : null;  // Corrigé ici
        $id_audience = isset($_POST['id_audience']) ? $_POST['id_audience'] : null;  // Corrigé ici
        $date_renvoi = isset($_POST['date_renvoi']) ? $_POST['date_renvoi'] : null;

        // Afficher les données reçues pour déboguer
        error_log("Données reçues : " . json_encode($_POST));

        // Construction de la requête SQL pour mettre à jour l'infraction
        $sql = "UPDATE audience
         SET audience_date = :date_audience,
         audience_juridiction = :juridiction,
          audience_type_proc = :type_procedure,
           audience_objet = :objet_audience,
            audience_observation = :observations_audience,
             audience_suite = :suites_audience,
              audience_date_renvoi = :date_renvoi 
              WHERE id_audience = :id_audience";

        // Préparation de la requête SQL
        $stmt = $bdd->prepare($sql);

        // Liaison des paramètres
        $stmt->bindParam(':date_audience', $date_audience);
        $stmt->bindParam(':juridiction', $juridiction);
        $stmt->bindParam(':type_procedure', $type_procedure);
        $stmt->bindParam(':objet_audience', $objet_audience);
        $stmt->bindParam(':observations_audience', $observations_audience);
        $stmt->bindParam(':suites_audience', $suites_audience);  // Corrigé ici
        $stmt->bindParam(':id_audience', $id_audience);  // Corrigé ici
        $stmt->bindParam(':date_renvoi', $date_renvoi);

        // Exécution de la requête
        $stmt->execute();

        // Affichage du résultat de la requête finale dans les logs
        $errorInfo = $stmt->errorInfo();
        if ($errorInfo[0] !== '00000') {
            error_log("Erreur lors de l'exécution de la requête : " . json_encode($errorInfo));
        } else {
            error_log("Requête exécutée avec succès.");
        }

        // Fermeture de la connexion à la base de données
        $bdd = null;

        // Retourner une réponse JSON indiquant le succès de l'opération
        header('Content-Type: application/json');
        echo json_encode(array('success' => true));
    } catch (PDOException $e) {
        // En cas d'erreur, retourner une réponse JSON avec un message d'erreur
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de la mise à jour de l\'audience : ' . $e->getMessage()));
    }
} else {
    // Retourner une réponse JSON si l'accès n'est pas autorisé
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>
