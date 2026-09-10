<?php
session_start();
include ("../../bd.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        $bdd = getBD();

        // Récupérer les données du formulaire
        $mail = isset($_POST['mail']) ? $_POST['mail'] : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';

        // Exemple de validation basique
        if (empty($mail) || empty($password)) {
            header('Content-Type: application/json');
            echo json_encode(array('success' => false, 'message' => 'Veuillez fournir un mail et un mot de passe.'));
            exit();
        }

        // Récupérer le mot de passe hashé depuis la base de données
        // $sql = "SELECT * FROM user WHERE mail = :mail";
        $sql = "SELECT u.*, r.nom_role FROM user u LEFT JOIN a_le_role alr ON u.id_user = alr.id_user LEFT JOIN role r ON alr.id_role = r.id_role WHERE u.mail = :mail";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Vérifier le mot de passe
        if ($user && password_verify($password, $user['password'])) {
            // Connexion réussie
            $_SESSION['utilisateur'] = $user;
            header('Content-Type: application/json');
            echo json_encode(array('success' => true));
        } else {
            // Échec de la connexion
            header('Content-Type: application/json');
            echo json_encode(array('success' => false, 'message' => 'Identifiants incorrects.'));
        }

        $bdd = null;
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('success' => false, 'message' => 'Erreur lors de la connexion.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'message' => 'Méthode non autorisée.'));
}
?>