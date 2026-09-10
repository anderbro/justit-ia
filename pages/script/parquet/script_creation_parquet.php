<?php
session_start();
// script pour créer les soit_transmis

include ("../../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire
        $soit_trans_numero = isset($_POST['numero_soit_transmis']) ? $_POST['numero_soit_transmis'] : null;
        $soit_trans_date = isset($_POST['date_transmis']) ? $_POST['date_transmis'] : null;
        $soit_trans_damande_parquet = isset($_POST['demande_parquet']) ? $_POST['demande_parquet'] : null;
        $soit_trans_date_premiere_audition = isset($_POST['date_premiere_audition']) && !empty($_POST['date_premiere_audition']) ? $_POST['date_premiere_audition'] : null;
        $soit_trans_date_limite_enquete = isset($_POST['date_limite_enquete']) && !empty($_POST['date_limite_enquete']) ? $_POST['date_limite_enquete'] : null;
        $soit_trans_priorite = isset($_POST['priorite']) ? $_POST['priorite'] : null;
        $soit_trans_traite = isset($_POST['traite']) ? (int) $_POST['traite'] : 0; // Convertir en entier
        $soit_trans_observation = isset($_POST['observations_transmis']) ? $_POST['observations_transmis'] : null;
        $id_parquet = isset($_POST['auteur_transmis']) ? $_POST['auteur_transmis'] : null;
        $id_dossier = isset($_POST['id_dossier']) ? $_POST['id_dossier'] : null;

        $sql = "INSERT INTO soit_transmis (soit_trans_numero, soit_trans_damande_parquet, soit_trans_date_premiere_audition, soit_trans_date_limite_enquete, soit_trans_priorite, soit_trans_traite, soit_trans_observation, id_parquet, id_dossier, soit_trans_date) 
        VALUES (:soit_trans_numero, :soit_trans_damande_parquet, :soit_trans_date_premiere_audition, :soit_trans_date_limite_enquete, :soit_trans_priorite, :soit_trans_traite, :soit_trans_observation, :id_parquet, :id_dossier, :soit_trans_date);";

        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':soit_trans_numero', $soit_trans_numero);
        $stmt->bindParam(':soit_trans_date', $soit_trans_date);
        $stmt->bindParam(':soit_trans_damande_parquet', $soit_trans_damande_parquet);
        $stmt->bindParam(':soit_trans_date_premiere_audition', $soit_trans_date_premiere_audition);
        $stmt->bindParam(':soit_trans_date_limite_enquete', $soit_trans_date_limite_enquete);
        $stmt->bindParam(':soit_trans_priorite', $soit_trans_priorite);
        $stmt->bindParam(':soit_trans_traite', $soit_trans_traite, PDO::PARAM_INT);
        $stmt->bindParam(':soit_trans_observation', $soit_trans_observation);
        $stmt->bindParam(':id_parquet', $id_parquet);
        $stmt->bindParam(':id_dossier', $id_dossier);
        $stmt->execute();

        $bdd = null;

        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Erreur lors de l\'insertion du parquet : ' . $e->getMessage()]);
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Accès non autorisé.']);
}
?>