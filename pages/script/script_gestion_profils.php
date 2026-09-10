<?php
include ("../../bd.php");

try {
    $bdd = getBD();

    // Exemple de requête pour récupérer tous les profils d'utilisateurs
    $sql = "SELECT user.id_user, user.nom, user.prenom,user.mail, role.role 
    FROM user
    INNER JOIN a_le_role ON user.id_user = a_le_role.id_user
    INNER JOIN role ON a_le_role.id_role = role.id_role;";

    $stmt = $bdd->query($sql);

    // Récupérer tous les utilisateurs
    $utilisateurs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($utilisateurs);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Erreur lors de la récupération des utilisateurs.'));
}

// Fermer la connexion à la base de données
$bdd = null;
?>