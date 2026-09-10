<?php
session_start();
include("../../bd.php");

if (isset($_SESSION['utilisateur'])) {
    try {
        $bdd = getBD();

        $utilisateurId = $_SESSION['utilisateur']['id_user'];

        // Obtenez les données du formulaire
        $prenom = $_POST['prenom'];
        $nom = $_POST['nom'];
        $mail = $_POST['mail'];

        // Mettez à jour les informations du profil
        $sql = "UPDATE user SET prenom = :prenom, nom = :nom, mail = :mail WHERE id_user = :utilisateurId";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':prenom', $prenom, PDO::PARAM_STR);
        $stmt->bindParam(':nom', $nom, PDO::PARAM_STR);
        $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
        $stmt->bindParam(':utilisateurId', $utilisateurId, PDO::PARAM_INT);

        $stmt->execute();

        $bdd = null;

        // Envoyez une réponse JSON indiquant que la modification a réussi
        header('Content-Type: application/json');
        echo json_encode(array('success' => true));
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('success' => false, 'error' => 'Erreur lors de la modification des détails.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'error' => 'Utilisateur non connecté.'));
}
?>
