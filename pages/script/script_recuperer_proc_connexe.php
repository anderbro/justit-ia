<?php
include("../../bd.php");

// Récupérer l'ID de la procédure connexe depuis la requête GET
$idProcedure = $_GET['id'];

try {
    // Connexion à la base de données
    $bdd = getBD();

    // Préparer et exécuter la requête SQL pour récupérer les détails de la procédure connexe
    $sql = "SELECT * FROM proc_connexes WHERE id_conn = :id";
    $stmt = $bdd->prepare($sql);
    $stmt->bindParam(':id', $idProcedure);
    $stmt->execute();

    // Récupérer les résultats
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    // Vérifier si des résultats ont été trouvés
    if ($row) {
        // Convertir les données en format JSON et les afficher
        echo json_encode($row);
    } else {
        // Si aucune procédure n'est trouvée avec cet ID, renvoyer un message d'erreur
        echo json_encode(["error" => "Aucune procédure connexe trouvée avec cet ID"]);
    }
} catch (PDOException $e) {
    // En cas d'erreur, afficher le message d'erreur
    echo json_encode(["error" => "Erreur de connexion à la base de données: " . $e->getMessage()]);
}
?>
