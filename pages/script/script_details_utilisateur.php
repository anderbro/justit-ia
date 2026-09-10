<?php
session_start();
include("../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    if (isset($_GET['id'])) {
        try {
            $bdd = getBD();

            $userId = $_GET['id'];
            $sql = "SELECT user.nom, user.prenom, user.mail, role.nom_role AS role
                    FROM user
                    LEFT JOIN a_le_role ON user.id_user = a_le_role.id_user
                    LEFT JOIN role ON a_le_role.id_role = role.id_role
                    WHERE user.id_user = :userId";
            $stmt = $bdd->prepare($sql);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            $bdd = null;

            header('Content-Type: application/json');
            echo json_encode(array('user' => $user));
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'Erreur lors de la récupération des détails de l\'utilisateur.'));
        }
    } else {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'ID d\'utilisateur manquant.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
