<?php
session_start();
include("../../bd.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire
        $mail = isset($_POST['mail']) ? $_POST['mail'] : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';
        $confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';
        $nom = isset($_POST['nom']) ? $_POST['nom'] : '';
        $prenom = isset($_POST['prenom']) ? $_POST['prenom'] : '';

        // Validation basique
        if (empty($mail) || empty($password) || empty($confirmPassword) || empty($nom) || empty($prenom)) {
            header('Content-Type: application/json');
            echo json_encode(array('success' => false, 'message' => 'Veuillez fournir tous les champs.'));
            exit();
        }

        // Vérifier si l'adresse e-mail existe déjà
        $checkEmailSql = "SELECT COUNT(*) FROM user WHERE mail = :mail";
        $checkEmailStmt = $bdd->prepare($checkEmailSql);
        $checkEmailStmt->bindParam(':mail', $mail, PDO::PARAM_STR);
        $checkEmailStmt->execute();
        $emailExists = (int) $checkEmailStmt->fetchColumn();

        if ($emailExists > 0) {
            header('Content-Type: application/json');
            echo json_encode(array('success' => false, 'message' => 'Cette adresse e-mail est déjà associée à un compte.'));
            exit();
        }

        // Vérifier si les mots de passe correspondent
        if ($password !== $confirmPassword) {
            header('Content-Type: application/json');
            echo json_encode(array('success' => false, 'message' => 'Les mots de passe ne correspondent pas.'));
            exit();
        }

        // Hasher le mot de passe
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Insérer l'utilisateur dans la base de données
        $insertUserSql = "INSERT INTO user (mail, password, prenom, nom) VALUES (:mail, :password, :prenom, :nom)";
        $insertUserStmt = $bdd->prepare($insertUserSql);
        $insertUserStmt->bindParam(':mail', $mail, PDO::PARAM_STR);
        $insertUserStmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
        $insertUserStmt->bindParam(':nom', $nom, PDO::PARAM_STR);
        $insertUserStmt->bindParam(':prenom', $prenom, PDO::PARAM_STR);
        $insertUserStmt->execute();

        // Récupérer l'id de l'utilisateur nouvellement créé
        $id_user = $bdd->lastInsertId();

        // Attribuer automatiquement le rôle 'basic_user'
        $id_role_basic_user = 2;  // l'id correspondant au rôle 'basic_user'
        $assignRoleSql = "INSERT INTO a_le_role (id_user, id_role) VALUES (:id_user, :id_role)";
        $assignRoleStmt = $bdd->prepare($assignRoleSql);
        $assignRoleStmt->bindParam(':id_user', $id_user, PDO::PARAM_INT);
        $assignRoleStmt->bindParam(':id_role', $id_role_basic_user, PDO::PARAM_INT);
        $assignRoleStmt->execute();

        // Inscription réussie
        header('Content-Type: application/json');
        echo json_encode(array('success' => true));
        exit();

        $bdd = null;
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('success' => false, 'message' => 'Erreur lors de l\'inscription.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'message' => 'Méthode non autorisée.'));
}
?>