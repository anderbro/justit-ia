<?php

include("../../bd.php");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['userId']) && isset($_POST['nouveauNom']) && isset($_POST['nouveauPrenom']) && isset($_POST['nouveauRole'])) {
    try {
        $bdd = getBD();

        $userId = $_POST['userId'];
        $nouveauNom = $_POST['nouveauNom'];
        $nouveauPrenom = $_POST['nouveauPrenom'];
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

        // Effectuer la mise à jour des données de l'utilisateur dans la base de données
        $sql = "UPDATE user SET nom = :nouveauNom, prenom = :nouveauPrenom WHERE id_user = :userId";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':nouveauNom', $nouveauNom, PDO::PARAM_STR);
        $stmt->bindParam(':nouveauPrenom', $nouveauPrenom, PDO::PARAM_STR);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();

        // Mise à jour du rôle dans la table de liaison
        $sqlRole = "UPDATE a_le_role SET id_role = :idRole WHERE id_user = :userId";
        $stmtRole = $bdd->prepare($sqlRole);
        $stmtRole->bindParam(':idRole', $idRole, PDO::PARAM_INT);
        $stmtRole->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmtRole->execute();

        // Répondre avec succès
        header('Content-Type: application/json');
        echo json_encode(array('success' => true));
        exit();
    } catch (PDOException $e) {
        // Répondre avec une erreur
        header('Content-Type: application/json');
        echo json_encode(array('success' => false, 'message' => 'Erreur lors de la sauvegarde des modifications.'));
    }
} else {
    // Répondre avec une erreur si les paramètres requis ne sont pas fournis
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'message' => 'Paramètres invalides.'));
}
?>