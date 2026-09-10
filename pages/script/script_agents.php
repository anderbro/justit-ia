<?php
session_start();
include("../../bd.php");

try {
    $bdd = getBD(); // Assurez-vous que la fonction getBD() retourne un objet PDO pour la connexion à la base de données

    $sql = "SELECT id, agent_nom, agent_prenom, agent_role FROM agent"; // Ajout de l'id dans la sélection

    // Exécution de la requête
    $stmt = $bdd->prepare($sql);
    $stmt->execute();

    // Récupération des résultats
    $agents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fermeture de la connexion à la base de données, si vous le souhaitez
    $bdd = null;

    // Renvoi des résultats sous forme de JSON
    echo json_encode(['agents' => $agents]);
} catch (PDOException $e) {
    // Gestion des erreurs
    http_response_code(500);
    echo json_encode(['message' => 'Erreur de base de données : ' . $e->getMessage()]);
}
?>