<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    include("../../../bd.php");
    $bdd = getBD();

    $date = $_POST['date'];
    $ref = $_POST['ref'];
    $auteur1 = $_POST['auteur1'];
    $type = $_POST['type'];
    $auteur2 = $_POST['auteur2'];
    $obs = $_POST['obs'];
    $id_dossier = $_POST['id_dossier'];

    try {
        $sql = "INSERT INTO proc_connexes (conn_date, conn_ref, conn_auteur_1, conn_type, conn_auteur_2, conn_obs, id_dossier) VALUES (:date, :ref, :auteur1, :type, :auteur2, :obs, :id_dossier)";
        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':date', $date, PDO::PARAM_STR);
        $stmt->bindParam(':ref', $ref, PDO::PARAM_STR);
        $stmt->bindParam(':auteur1', $auteur1, PDO::PARAM_STR);
        $stmt->bindParam(':type', $type, PDO::PARAM_STR);
        $stmt->bindParam(':auteur2', $auteur2, PDO::PARAM_STR);
        $stmt->bindParam(':obs', $obs, PDO::PARAM_STR);
        $stmt->bindParam(':id_dossier', $id_dossier, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Nouvelle procédure connexe ajoutée avec succès.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'ajout de la procédure connexe.']);
    }
} else {
    http_response_code(405); // Méthode non autorisée si ce n'est pas une requête POST
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
}
?>