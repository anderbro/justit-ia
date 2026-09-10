<?php
session_start();
include("../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        $sql = "SELECT id_role, nom_role FROM role";
        $stmt = $bdd->prepare($sql);
        $stmt->execute();

        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $bdd = null;

        header('Content-Type: application/json');
        echo json_encode(array('roles' => $roles));
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de la récupération de la liste des rôles.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>