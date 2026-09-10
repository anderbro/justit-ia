<?php
session_start();
include("../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        $sql = "SELECT user.id_user, user.nom, user.prenom, user.mail, role.nom_role AS role
        FROM user
        LEFT JOIN a_le_role ON user.id_user = a_le_role.id_user
        LEFT JOIN role ON a_le_role.id_role = role.id_role";
        $stmt = $bdd->prepare($sql);
        $stmt->execute();

        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $bdd = null;

        header('Content-Type: application/json');
        echo json_encode(array('users' => $users));
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de la récupération de la liste des utilisateurs.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>