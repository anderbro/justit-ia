<?php
session_start();
include("../bd.php");
$bdd = getBD();

if (isset($_POST['edit_button'])) {
    if (isset($_POST['id_pv'])) {

       

        $id_pv = $_POST['id_pv'];
        echo $id_pv;
        // Construire la requête de mise à jour
        $sql = "UPDATE signalement_pv SET ";
        $params = array();
        
        foreach ($_POST as $champ => $valeur) {
            if ($champ === 'id_pv' || $champ === 'edit_button') {
                continue;
            }

            $sql .= "$champ = :$champ, ";
            $params[":$champ"] = $valeur;
        }

        // Supprimer la virgule finale
        $sql = rtrim($sql, ', ');

        $sql .= " WHERE id_pv = :id_pv";
        $params[':id_pv'] = $id_pv;

        $stmt = $bdd->prepare($sql);

        try {
            $stmt->execute($params);

            // Rediriger vers la page de confirmation
            header("Location: ../index.php");
            exit();
        } catch (PDOException $e) {
            // echo '<meta http-equiv="Refresh" content="0; url=../index.php"/>' ;
            echo "Erreur lors de la mise à jour : " . $e->getMessage();
        }
    } else {
        echo '<meta http-equiv="Refresh" content="0; url=../index.php"/>' ;
        echo "Numéro de pv manquant. Assurez-vous que le formulaire a été correctement soumis.";
    }
}
?>
