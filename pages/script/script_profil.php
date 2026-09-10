<?php
// script_profil.php

session_start();
include("../../bd.php");

if (isset($_SESSION['utilisateur'])) {
    try {
        $bdd = getBD();
        $utilisateurId = $_SESSION['utilisateur']['id_user'];

        if ($_SERVER["REQUEST_METHOD"] === "POST") {
            // Si le formulaire est soumis pour mettre à jour le profil
            $newPrenom = isset($_POST['prenom']) ? $_POST['prenom'] : '';
            $newNom = isset($_POST['nom']) ? $_POST['nom'] : '';
            $newMail = isset($_POST['mail']) ? $_POST['mail'] : '';
            $oldPassword = isset($_POST['oldPassword']) ? $_POST['oldPassword'] : '';
            $newPassword = isset($_POST['newPassword']) ? $_POST['newPassword'] : '';
            $confirmNewPassword = isset($_POST['confirmNewPassword']) ? $_POST['confirmNewPassword'] : '';

            // Vérification de l'ancien mot de passe
            $sqlCheckPassword = "SELECT password FROM user WHERE id_user = :utilisateurId";
            $stmtCheckPassword = $bdd->prepare($sqlCheckPassword);
            $stmtCheckPassword->bindParam(':utilisateurId', $utilisateurId, PDO::PARAM_INT);
            $stmtCheckPassword->execute();
            $hashedOldPassword = $stmtCheckPassword->fetchColumn();

            if (!password_verify($oldPassword, $hashedOldPassword)) {
                // Ancien mot de passe incorrect
                header('Content-Type: application/json');
                echo json_encode(array('error' => 'Ancien mot de passe incorrect.'));
                exit();
            }

            // Vérification du nouveau mot de passe
            if (!empty($newPassword) || !empty($confirmNewPassword)) {
                if ($newPassword !== $confirmNewPassword) {
                    // Les nouveaux mots de passe ne correspondent pas
                    header('Content-Type: application/json');
                    echo json_encode(array('error' => 'Les nouveaux mots de passe ne correspondent pas.'));
                    exit();
                }

                // Mettre à jour le mot de passe dans la base de données
                $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $sqlUpdatePassword = "UPDATE user SET password = :hashedNewPassword WHERE id_user = :utilisateurId";
                $stmtUpdatePassword = $bdd->prepare($sqlUpdatePassword);
                $stmtUpdatePassword->bindParam(':hashedNewPassword', $hashedNewPassword, PDO::PARAM_STR);
                $stmtUpdatePassword->bindParam(':utilisateurId', $utilisateurId, PDO::PARAM_INT);
                $stmtUpdatePassword->execute();
            }

            // Mettre à jour les détails du profil dans la base de données
            $sqlUpdateProfile = "UPDATE user SET prenom = :newPrenom, nom = :newNom, mail = :newMail WHERE id_user = :utilisateurId";
            $stmtUpdateProfile = $bdd->prepare($sqlUpdateProfile);
            $stmtUpdateProfile->bindParam(':newPrenom', $newPrenom, PDO::PARAM_STR);
            $stmtUpdateProfile->bindParam(':newNom', $newNom, PDO::PARAM_STR);
            $stmtUpdateProfile->bindParam(':newMail', $newMail, PDO::PARAM_STR);
            $stmtUpdateProfile->bindParam(':utilisateurId', $utilisateurId, PDO::PARAM_INT);
            $stmtUpdateProfile->execute();

            header('Content-Type: application/json');
            echo json_encode(array('success' => true, 'message' => 'Profil mis à jour avec succès.'));
            exit();
        }

        // Si la requête n'est pas de type POST, renvoyer les détails du profil
        $sql = "SELECT prenom, nom, mail FROM user WHERE id_user = :utilisateurId";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':utilisateurId', $utilisateurId, PDO::PARAM_INT);
        $stmt->execute();
        $profil = $stmt->fetch(PDO::FETCH_ASSOC);

        header('Content-Type: application/json');
        echo json_encode(array('profil' => $profil));
        exit();
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de la récupération des détails.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Utilisateur non connecté.'));
}
?>