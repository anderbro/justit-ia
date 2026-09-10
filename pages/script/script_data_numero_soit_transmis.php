<?php
// Inclure le fichier de connexion à la base de données
include ("../../bd.php");

try {
    // Connexion à la base de données
    $bdd = getBD();

    // Récupérer l'ID du dossier depuis l'URL
    $id_dossier = isset($_GET['id_dossier']) ? intval($_GET['id_dossier']) : null;
    error_log($id_dossier);
    if ($id_dossier === null) {
        throw new Exception('ID du dossier non spécifié.');
    }

    // Requête SQL pour récupérer les numéros de soit transmis où id_dossier = :id_dossier

    $sql = "SELECT soit_trans_numero FROM soit_transmis WHERE id_dossier = :id_dossier";

    error_log($sql);
    $stmt = $bdd->prepare($sql);
    $stmt->bindParam(':id_dossier', $id_dossier, PDO::PARAM_INT);
    $stmt->execute();
    $numeros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log(json_encode($numeros));
    // Renvoyer les numéros au format JSON
    header('Content-Type: application/json');
    echo json_encode($numeros);
} catch (Exception $e) {
    // En cas d'erreur de connexion ou de requête, renvoyer une erreur
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Erreur lors de la récupération des données : ' . $e->getMessage()]);
}
?>