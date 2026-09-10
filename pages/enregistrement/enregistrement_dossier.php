<?php
session_start();
include("../bd.php");
$bdd = getBD();

if (isset($_POST['edit_button'])) {
    if (isset($_POST['num_dossier'])) {

        $num_dossier = $_POST['num_dossier'];

        // Construire la requête de mise à jour
        $sql = "UPDATE dossier SET ";
        $params = array();
        
        foreach ($_POST as $champ => $valeur) {
            if ($champ === 'num_dossier' || $champ === 'edit_button') {
                continue;
            }

            $sql .= "$champ = :$champ, ";
            $params[":$champ"] = $valeur;
        }

        // Supprimer la virgule finale
        $sql = rtrim($sql, ', ');

        $sql .= " WHERE num_dossier = :num_dossier";
        $params[':num_dossier'] = $num_dossier;

        $stmt = $bdd->prepare($sql);

        try {
            $stmt->execute($params);

            // Rediriger vers la page de confirmation
            header("Location: ../index.php");
            exit();
        } catch (PDOException $e) {
            echo "Erreur lors de la mise à jour : " . $e->getMessage();
        }
    } else {
        echo "Numéro de dossier manquant. Assurez-vous que le formulaire a été correctement soumis.";
    }
}
?>
