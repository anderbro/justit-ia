<?php
session_start();
include("../../../bd.php");

header('Content-Type: application/json');

try {
    // Connexion à la base de données
    $bdd = getBD();

    // Récupération des données POST
    $id = $_POST['id_soit_transmis'];
    $numero_soit_transmis = $_POST['numero_soit_transmis'];
    $demande_parquet = $_POST['demande_parquet'];
    $date_premiere_audition = $_POST['date_premiere_audition'];
    $date_limite_enquete = $_POST['date_limite_enquete'];
    $priorite = $_POST['priorite'];
    $traite = $_POST['traite'] === 'true' ? 1 : 0; // Conversion en booléen
    $observations_transmis = $_POST['observations_transmis'];
    $auteur_transmis = $_POST['auteur_transmis'];
    $date_transmis = $_POST['date_transmis'];

    // Préparation de la requête SQL
    $sql = "UPDATE soit_transmis SET
                soit_trans_numero = :numero_soit_transmis,
                soit_trans_damande_parquet = :demande_parquet,
                soit_trans_date_premiere_audition = :date_premiere_audition,
                soit_trans_date_limite_enquete = :date_limite_enquete,
                soit_trans_priorite = :priorite,
                soit_trans_traite = :traite,
                soit_trans_observation = :observations_transmis,
                id_parquet = :auteur_transmis,
                soit_trans_date = :date_transmis
            WHERE id_soit_transmis = :id";

    $stmt = $bdd->prepare($sql);

    // Liaison des paramètres
    $stmt->bindParam(':numero_soit_transmis', $numero_soit_transmis);
    $stmt->bindParam(':demande_parquet', $demande_parquet);
    $stmt->bindParam(':date_premiere_audition', $date_premiere_audition);
    $stmt->bindParam(':date_limite_enquete', $date_limite_enquete);
    $stmt->bindParam(':priorite', $priorite);
    $stmt->bindParam(':traite', $traite, PDO::PARAM_BOOL);
    $stmt->bindParam(':observations_transmis', $observations_transmis);
    $stmt->bindParam(':auteur_transmis', $auteur_transmis, PDO::PARAM_INT);
    $stmt->bindParam(':date_transmis', $date_transmis);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    // Exécution de la requête
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Mise à jour réussie']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
}
?>
