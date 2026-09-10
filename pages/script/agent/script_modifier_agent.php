<?php
// Inclure le fichier de connexion à la base de données
include("../../../bd.php");

// Vérifier la méthode de requête
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['id']) && isset($_POST['nouveau_nom']) && isset($_POST['nouveau_prenom']) && isset($_POST['nouveau_role']) && isset($_POST['nouveau_service'])) {
    try {
        // Récupérer les données de l'agent à modifier
        $id = $_POST['id'];
        $nouveau_nom = $_POST['nouveau_nom'];
        $nouveau_prenom = $_POST['nouveau_prenom'];
        $nouveau_role = $_POST['nouveau_role'];
        $nouveau_service = $_POST['nouveau_service'];
        // Connexion à la base de données
        $bdd = getBD();

        // Préparation de la requête SQL pour la modification
        $sql = "UPDATE agent SET agent_nom = :nouveau_nom, agent_prenom = :nouveau_prenom, agent_role = :nouveau_role, agent_service = :nouveau_service WHERE id = :id";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':nouveau_nom', $nouveau_nom, PDO::PARAM_STR);
        $stmt->bindParam(':nouveau_prenom', $nouveau_prenom, PDO::PARAM_STR);
        $stmt->bindParam(':nouveau_role', $nouveau_role, PDO::PARAM_STR);
        $stmt->bindParam(':nouveau_service', $nouveau_service, PDO::PARAM_STR);
        $stmt->execute();

        // Répondre avec succès
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Agent modifié avec succès.']);
        exit();
    } catch (Exception $e) {
        // Envoi d'une réponse d'erreur en cas d'exception
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    // Envoi d'une réponse d'erreur si les paramètres requis ne sont pas fournis ou si la méthode de la requête est incorrecte
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Paramètres invalides ou méthode non autorisée.']);
}
?>
