<?php

session_start();

include("../../bd.php");

$bdd = getBD();


if (isset($_POST['create_button'])) {
    
    if (isset($_POST['create_button'])) {
        // Construire la requête d'insertion
        $sql = "INSERT INTO signalement_pv (";
        $params = array();
        $values = array();
    
        foreach ($_POST as $champ => $valeur) {
            // Vous pouvez ignorer 'create_button' car c'est un bouton de soumission
            if ($champ === 'create_button') {
                continue;
            }
            
            $sql .= "$champ, ";
            $params[":$champ"] = $valeur;
            $values[] = ":$champ";
        }
    
        // Supprimer la virgule finale
        $sql = rtrim($sql, ', ');
        $sql .= ") VALUES (";
        $sql .= implode(', ', $values);
        $sql .= ")";
    
        // echo "Requête SQL : " . $sql;  // Pour le débogage
    
        $stmt = $bdd->prepare($sql);
    
        try {
            $stmt->execute($params);
    
            // Rediriger vers la page de confirmation
            header("Location: ../../index.php");
            exit();
        } catch (PDOException $e) {
            echo "Erreur lors de l'insertion : " . $e->getMessage();
        }
    }
    } else {
        echo "Numéro de dossier manquant. Assurez-vous que le formulaire a été correctement soumis.";
    }

?>
