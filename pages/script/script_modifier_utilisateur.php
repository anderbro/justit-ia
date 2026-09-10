<?php
session_start();
include("../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            $bdd = getBD();

            // Récupérer les données du formulaire
            $userId = $_POST['id_user'];
            $prenom = $_POST['prenom'];
            $nom = $_POST['nom'];
            $mail = $_POST['mail'];
            $role = $_POST['role'];

            // Vérifier si un nouveau mot de passe a été fourni
            if (!empty($_POST['newPassword'])) {
                $newPassword = password_hash($_POST['newPassword'], PASSWORD_DEFAULT);
                $sql = "UPDATE user SET prenom = :prenom, nom = :nom, mail = :mail, password = :newPassword WHERE id_user = :userId ";
            } else {
                $sql = "UPDATE user SET prenom = :prenom, nom = :nom, mail = :mail WHERE id_user = :userId";
            }

            // Vérifier si un nouveau rôle a été fourni
            if (!empty($role)) {
                $sql .= "; UPDATE a_le_role SET id_role = (SELECT id_role FROM role WHERE id_role = :role) WHERE id_user = :userId";
            }

            // Ajoutez ces lignes pour afficher la requête dans la sortie d'erreur du serveur
            error_log("SQL Query: " . $sql);
            error_log("Parameters: userId=$userId, prenom=$prenom, nom=$nom, mail=$mail, role=$role");

            $stmt = $bdd->prepare($sql);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':prenom', $prenom, PDO::PARAM_STR);
            $stmt->bindParam(':nom', $nom, PDO::PARAM_STR);
            $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);

            // Si un nouveau mot de passe a été fourni, ajouter le paramètre à la requête
            if (!empty($_POST['newPassword'])) {
                $stmt->bindParam(':newPassword', $newPassword, PDO::PARAM_STR);
            }

            // Si un nouveau rôle a été fourni, ajouter le paramètre à la requête
            if (!empty($role)) {
                $stmt->bindParam(':role', $role, PDO::PARAM_STR);
            }

            $stmt->execute();

            $bdd = null;

            header('Content-Type: application/json');
            echo json_encode(array('success' => true));
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'Erreur lors de la modification de l\'utilisateur.', 'details' => $e->getMessage()));
        }
    } else {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Méthode non autorisée.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>