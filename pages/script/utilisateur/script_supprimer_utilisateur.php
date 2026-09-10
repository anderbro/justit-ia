<?php
include("../../../bd.php");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['userId'])) {

    try {
        $bdd = getBD();

        $userId = $_POST['userId'];

        // Effectuer une requête pour supprimer l'utilisateur
        $sql = "DELETE FROM user WHERE id_user = :userId";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();

        // Effectuer une requête pour supprimer la relation de l'utilisateur avec les rôles
        $sqlDeleteRoleRelation = "DELETE FROM a_le_role WHERE id_user = :userId";
        $stmtDeleteRoleRelation = $bdd->prepare($sqlDeleteRoleRelation);
        $stmtDeleteRoleRelation->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmtDeleteRoleRelation->execute();

        // Répondre avec succès
        header('Content-Type: application/json');
        echo json_encode(array('success' => true));
        exit();
    } catch (PDOException $e) {
        // Répondre avec une erreur
        header('Content-Type: application/json');
        echo json_encode(array('success' => false, 'message' => 'Erreur lors de la suppression de l\'utilisateur.'));
    }
} else {
    // Répondre avec une erreur si les paramètres requis ne sont pas fournis
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'message' => 'Paramètres invalides.'));
}

?>