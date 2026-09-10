<?php

session_start();
include("../../bd.php");

try {
    $bdd = getBD();
    // Récupérer la valeur de recherche depuis la requête GET
    $searchValue = isset($_GET['search']) ? $_GET['search'] : '';

    // Préparer et exécuter la requête de recherche


    $sql = "SELECT * FROM contrevenant WHERE contrevenant LIKE :searchValue OR nom LIKE :searchValue OR representant_legal LIKE :searchValue OR SIRET_SIREN LIKE :searchValue";

    $stmt = $bdd->prepare($sql);
    $stmt->bindValue(':searchValue', "%$searchValue%", PDO::PARAM_STR);
    $stmt->execute();

    // Récupérer les résultats de la recherche
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retourner les résultats au format JSON
    echo json_encode(['results' => $results]);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erreur PDO : ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur générale : ' . $e->getMessage()]);
}

// Fermer la connexion à la base de données
$conn = null;
?>