<?php
session_start();
include("../../../bd.php");

try {
    // Connexion à la base de données
    $bdd = getBD();
    $bdd->beginTransaction();

    // Récupération des données POST
    if (isset($_POST['id_avis'], $_POST['conclusion_avis'], $_POST['observations_avis'], $_POST['date_avis'], $_POST['numero_soit_transmis'])) {
        $id_avis = $_POST['id_avis'];
        $conclusion_avis = $_POST['conclusion_avis'];
        $observations_avis = $_POST['observations_avis'];
        $date_avis = $_POST['date_avis'];
        $soit_trans_numero = $_POST['numero_soit_transmis'];

        // Logs des données reçues pour débogage
        error_log("ID Avis: $id_avis");
        error_log("Conclusion Avis: $conclusion_avis");
        error_log("Observations Avis: $observations_avis");
        error_log("Date Avis: $date_avis");
        error_log("Numéro Soit Transmis: $soit_trans_numero");

        // Préparation de la requête SQL pour la table avis
        $sql = "UPDATE avis 
                SET 
                    avis_conclusion = :conclusion_avis,
                    avis_observations = :observations_avis,
                    avis_date = :date_avis
                WHERE 
                    id_avis = :id_avis";

        $stmt = $bdd->prepare($sql);

        // Liaison des paramètres
        $stmt->bindParam(':conclusion_avis', $conclusion_avis);
        $stmt->bindParam(':observations_avis', $observations_avis);
        $stmt->bindParam(':date_avis', $date_avis);
        $stmt->bindParam(':id_avis', $id_avis, PDO::PARAM_INT);

        // Vérification si le soit_transmis existe
        $sqlCheck = "SELECT id_soit_transmis FROM soit_transmis WHERE soit_trans_numero = :soit_trans_numero";
        $stmtCheck = $bdd->prepare($sqlCheck);
        $stmtCheck->bindParam(':soit_trans_numero', $soit_trans_numero, PDO::PARAM_STR);
        $stmtCheck->execute();
        $soitTransmis = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($soitTransmis) {
            $id_soit_transmis = $soitTransmis['id_soit_transmis'];
            error_log("ID Soit Transmis trouvé : $id_soit_transmis");


            // Vérification de l'existence de l'association dans fais_objet
            $sqlCheckFaisObjet = "SELECT COUNT(*) FROM fais_objet WHERE id_avis = :id_avis AND id_soit_transmis = :id_soit_transmis";
            $stmtCheckFaisObjet = $bdd->prepare($sqlCheckFaisObjet);
            $stmtCheckFaisObjet->bindParam(':id_avis', $id_avis, PDO::PARAM_INT);
            $stmtCheckFaisObjet->bindParam(':id_soit_transmis', $id_soit_transmis, PDO::PARAM_INT);
            $stmtCheckFaisObjet->execute();
            $count = $stmtCheckFaisObjet->fetchColumn();

            if ($count == 0) {
                // Supprimer les anciennes associations de fais_objet
                $sqlDeleteFaisObjet = "DELETE FROM fais_objet WHERE id_avis = :id_avis";
                $stmtDeleteFaisObjet = $bdd->prepare($sqlDeleteFaisObjet);
                $stmtDeleteFaisObjet->bindParam(':id_avis', $id_avis, PDO::PARAM_INT);
                $stmtDeleteFaisObjet->execute();

                // Insérer la nouvelle association dans fais_objet
                $sqlInsertFaisObjet = "INSERT INTO fais_objet (id_soit_transmis, id_avis) VALUES (:id_soit_transmis, :id_avis)";
                $stmtInsertFaisObjet = $bdd->prepare($sqlInsertFaisObjet);
                $stmtInsertFaisObjet->bindParam(':id_soit_transmis', $id_soit_transmis, PDO::PARAM_INT);
                $stmtInsertFaisObjet->bindParam(':id_avis', $id_avis, PDO::PARAM_INT);
                $stmtInsertFaisObjet->execute();
            }

            // Exécution des requêtes
            $successAvis = $stmt->execute();

            if ($successAvis) {
                $bdd->commit();
                echo json_encode(['success' => true, 'message' => 'Mise à jour réussie']);
            } else {
                $bdd->rollBack();
                echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
            }
        } else {
            error_log("Le numéro de soit transmis n'existe pas : $soit_trans_numero");
            echo json_encode(['success' => false, 'message' => 'Le numéro de soit transmis n\'existe pas.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Données POST manquantes']);
    }
} catch (Exception $e) {
    if ($bdd->inTransaction()) {
        $bdd->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
}
?>
