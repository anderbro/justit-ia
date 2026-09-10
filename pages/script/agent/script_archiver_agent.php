<?php
// Inclure le fichier de connexion à la base de données
include("../../../bd.php");

// Vérifier la méthode de requête
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['id'])) {
    try {
        // Récupérer l'ID de l'agent à mettre à jour
        $id = $_POST['id'];

        // Validation de l'ID (pour s'assurer qu'il n'est pas vide et qu'il est numérique)
        if (!empty($id) && is_numeric($id)) {
            // Connexion à la base de données
            $bdd = getBD();

            // Préparation de la requête SQL pour la mise à jour de l'agent_archive
            $sql = "UPDATE agent SET agent_archive = 1 WHERE id = :id";
            $stmt = $bdd->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            // Répondre avec succès
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'message' => 'Agent archivé avec succès.']);
            exit();
        } else {
            // Envoi d'une réponse d'erreur si l'ID n'est pas valide
            throw new Exception('ID de l\'agent non spécifié ou invalide.');
        }
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