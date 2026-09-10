<?php
session_start();
include("../../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire
        $num_soit_transmis = $_POST['numero_soit_transmis'] ?? null;
        $conclusion_avis = $_POST['conclusion_avis'] ?? null;
        $observation_avis = $_POST['observations_avis'] ?? null;
        $date_avis = $_POST['date_avis'] ?? null;

        // Ajout de logs pour vérifier les données POST
        error_log("Données reçues :");
        error_log("numero_soit_transmis: " . $num_soit_transmis);
        error_log("conclusion_avis: " . $conclusion_avis);
        error_log("observations_avis: " . $observation_avis);
        error_log("date_avis: " . $date_avis);

        // Vérifier que les champs requis sont remplis
        if ($num_soit_transmis && $conclusion_avis && $observation_avis && $date_avis) {
            // Vérifier que le soit_transmis existe
            $sqlCheckSoitTransmis = "SELECT id_soit_transmis FROM soit_transmis WHERE soit_trans_numero = :soit_trans_numero";
            $stmtCheckSoitTransmis = $bdd->prepare($sqlCheckSoitTransmis);
            $stmtCheckSoitTransmis->bindParam(':soit_trans_numero', $num_soit_transmis, PDO::PARAM_STR);
            $stmtCheckSoitTransmis->execute();
            $soitTransmis = $stmtCheckSoitTransmis->fetch(PDO::FETCH_ASSOC);

            if ($soitTransmis) {
                // Commencer une transaction
                $bdd->beginTransaction();

                // Insérer un nouvel avis
                $sqlInsertAvis = "INSERT INTO avis (avis_conclusion, avis_observations, avis_date) 
                                  VALUES (:avis_conclusion, :avis_observations, :avis_date)";
                $stmtInsertAvis = $bdd->prepare($sqlInsertAvis);
                $stmtInsertAvis->bindParam(':avis_conclusion', $conclusion_avis);
                $stmtInsertAvis->bindParam(':avis_observations', $observation_avis);
                $stmtInsertAvis->bindParam(':avis_date', $date_avis);
                $stmtInsertAvis->execute();

                // Récupérer l'ID de l'avis inséré
                $lastInsertId = $bdd->lastInsertId();
                error_log("Nouvel ID d'avis inséré : " . $lastInsertId);

                // Insérer dans fais_objet
                $id_soit_transmis = $soitTransmis['id_soit_transmis'];
                $sqlInsertFaisObjet = "INSERT INTO fais_objet (id_soit_transmis, id_avis) VALUES (:id_soit_transmis, :id_avis)";
                $stmtInsertFaisObjet = $bdd->prepare($sqlInsertFaisObjet);
                $stmtInsertFaisObjet->bindParam(':id_soit_transmis', $id_soit_transmis, PDO::PARAM_INT);
                $stmtInsertFaisObjet->bindParam(':id_avis', $lastInsertId, PDO::PARAM_INT);
                $stmtInsertFaisObjet->execute();

                // Valider la transaction
                $bdd->commit();

                // Répondre avec succès
                echo json_encode(['success' => true, 'id' => $lastInsertId]);
            } else {
                // Le numéro de soit transmis n'existe pas
                echo json_encode(['error' => 'Le numéro de soit transmis n\'existe pas.']);
            }
        } else {
            // Gérer les champs manquants
            echo json_encode(['error' => 'Tous les champs requis ne sont pas remplis.']);
        }
    } catch (Exception $e) {
        // En cas d'erreur, annuler la transaction
        $bdd->rollBack();

        // Gérer les erreurs
        error_log("Erreur lors de l'insertion des données : " . $e->getMessage());
        echo json_encode(['error' => 'Erreur lors de l\'insertion des données : ' . $e->getMessage()]);
    }
} else {
    // Gérer l'accès non autorisé
    echo json_encode(['error' => 'Accès non autorisé.']);
}
?>
