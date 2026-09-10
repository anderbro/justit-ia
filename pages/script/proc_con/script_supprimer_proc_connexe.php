<?php
// script_suppression_proc_connexe.php
session_start();

// Inclure le fichier de connexion à la base de données
include("../../../bd.php");
$bdd = getBD();

try {
    // Récupérer l'ID de la procédure connexe depuis la requête POST
    $id_proc_connexe = isset($_POST['id']) ? $_POST['id'] : null;

    // Vérifier si l'ID de la procédure connexe a été correctement récupéré
    if ($id_proc_connexe !== null) {
        // Préparer la requête SQL pour supprimer la procédure connexe de la base de données
        $stmt = $bdd->prepare("DELETE FROM proc_connexes WHERE id_conn = :id_proc_connexe");
        $stmt->bindParam(':id_proc_connexe', $id_proc_connexe, PDO::PARAM_INT);
        $stmt->execute();

        // Retourner une réponse JSON indiquant le succès de l'opération
        echo json_encode(['success' => true]);
    } else {
        // Retourner une réponse JSON avec un message d'erreur si l'ID de la procédure connexe est manquant
        echo json_encode(['success' => false, 'message' => 'ID de la procédure connexe manquant']);
    }
} catch (PDOException $e) {
    // Retourner une réponse JSON avec un message d'erreur en cas d'échec de la suppression
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
} finally {
    // Fermer la connexion à la base de données
    $bdd = null;
}
?>