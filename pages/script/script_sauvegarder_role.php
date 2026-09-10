<?php

include("../../bd.php");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['userId']) && isset($_POST['nouveauRole'])) {
    try {
        $bdd = getBD();

        $userId = $_POST['userId'];
        $nouveauRole = $_POST['nouveauRole'];

        // Rechercher l'ID du nouveau rôle
        $stmtRole = $bdd->prepare("SELECT id_role FROM role WHERE role = :nouveauRole");
        $stmtRole->bindParam(':nouveauRole', $nouveauRole, PDO::PARAM_STR);
        $stmtRole->execute();
        $resultRole = $stmtRole->fetch(PDO::FETCH_ASSOC);

        if (!$resultRole) {
            // Si le rôle n'existe pas, vous pouvez gérer cela en conséquence
            header('Content-Type: application/json');
            echo json_encode(array('success' => false, 'message' => 'Le rôle spécifié n\'existe pas.'));
            exit();
        }

        $idRole = $resultRole['id_role'];

        // Effectuer la mise à jour du rôle dans la base de données
        $sql = "UPDATE a_le_role SET id_role = :idRole WHERE id_user = :userId";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':idRole', $idRole, PDO::PARAM_INT);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();

        // Répondre avec succès
        header('Content-Type: application/json');
        echo json_encode(array('success' => true));
        exit();

    } catch (PDOException $e) {
        // Répondre avec une erreur
        header('Content-Type: application/json');
        echo json_encode(array('success' => false, 'message' => 'Erreur lors de la sauvegarde du rôle.'));
    }
} else {
    // Répondre avec une erreur si les paramètres requis ne sont pas fournis
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'message' => 'Paramètres invalides.'));
}


?>