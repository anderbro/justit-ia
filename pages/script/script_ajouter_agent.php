<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    include("../../bd.php");
    $bdd = getBD();

    $nom = $_POST['nom'];
    $prenom = $_POST['prenom'];
    $role = $_POST['role'];

    try {
        $sql = "INSERT INTO agent (agent_nom, agent_prenom, agent_role) VALUES (:nom, :prenom, :role)";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':nom', $nom, PDO::PARAM_STR);
        $stmt->bindParam(':prenom', $prenom, PDO::PARAM_STR);
        $stmt->bindParam(':role', $role, PDO::PARAM_STR);
        $stmt->execute();

        echo json_encode(['message' => 'Agent ajouté avec succès.']);
    } catch (PDOException $e) {
        // Afficher les valeurs de chaque variable dans le message d'erreur
        $errorMessage = 'Erreur lors de l\'ajout de l\'agent. Détails : Nom = ' . $nom . ', Prénom = ' . $prenom . ', Rôle = ' . $role;
        http_response_code(500); // Envoyer un code d'état HTTP approprié pour une erreur serveur
        echo json_encode(['message' => $errorMessage]);
    }
} else {
    http_response_code(405); // Méthode non autorisée si ce n'est pas une requête POST
    echo json_encode(['message' => 'Méthode non autorisée.']);
}
?>