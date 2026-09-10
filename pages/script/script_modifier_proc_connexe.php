<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// Vérifier si les données du formulaire ont été envoyées
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Récupérer les données du formulaire
    $idProcedure = isset($_POST['id_procedure']) ? $_POST['id_procedure'] : null;
    $date = isset($_POST['date']) ? $_POST['date'] : null;
    $ref = isset($_POST['ref']) ? $_POST['ref'] : null;
    $auteur1 = isset($_POST['auteur1']) ? $_POST['auteur1'] : null;
    $type = isset($_POST['type']) ? $_POST['type'] : null;
    $auteur2 = isset($_POST['auteur2']) ? $_POST['auteur2'] : null;
    $observation = isset($_POST['observation']) ? $_POST['observation'] : null;

    try {
        // Connexion à la base de données
        $bdd = new PDO(
            'mysql:host=localhost;dbname=astreintes_juridiques','root','root'
        );

        // Préparer la requête SQL de mise à jour
        $sql = "UPDATE proc_connexes SET conn_date = :date, conn_ref = :ref, conn_auteur_1 = :auteur1, conn_type = :type, conn_auteur_2 = :auteur2, conn_obs = :observation WHERE id_conn = :idProcedure";

        // Préparer et exécuter la requête
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':date', $date, PDO::PARAM_STR);
        $stmt->bindParam(':ref', $ref, PDO::PARAM_STR);
        $stmt->bindParam(':auteur1', $auteur1, PDO::PARAM_STR);
        $stmt->bindParam(':type', $type, PDO::PARAM_STR);
        $stmt->bindParam(':auteur2', $auteur2, PDO::PARAM_STR);
        $stmt->bindParam(':observation', $observation, PDO::PARAM_STR);
        $stmt->bindParam(':idProcedure', $idProcedure, PDO::PARAM_INT);
        $stmt->execute();

        // Répondre avec un message de succès au format JSON
        echo json_encode(["success" => true, "message" => "Les informations de la procédure connexe ont été mises à jour avec succès"]);
    } catch(PDOException $e) {
        // En cas d'erreur, répondre avec un message d'erreur au format JSON
        echo json_encode(["success" => false, "message" => "Erreur lors de la mise à jour des informations de la procédure connexe : " . $e->getMessage()]);
    }
} else {
    // Si la requête n'est pas une requête POST, répondre avec un message d'erreur au format JSON
    echo json_encode(["success" => false, "message" => "La requête n'est pas une requête POST"]);
}
?>
