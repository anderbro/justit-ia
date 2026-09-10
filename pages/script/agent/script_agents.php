<?php
session_start();
include ("../../../bd.php");

try {
    $bdd = getBD();

    $sql = "SELECT id, agent_nom, agent_prenom,agent_service,agent_role FROM agent where agent_archive = 0";

    // Exécution de la requête
    $stmt = $bdd->prepare($sql);
    $stmt->execute();

    // Récupération des résultats
    $agents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fermeture de la connexion à la base de données
    $bdd = null;

    // Renvoi des résultats sous forme de JSON
    echo json_encode(['agents' => $agents]);
} catch (PDOException $e) {
    // Gestion des erreurs
    http_response_code(500);
    echo json_encode(['message' => 'Erreur de base de données : ' . $e->getMessage()]);
}
?>