<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();
        
        // Vérifier si le paramètre id_contrevenant est présent dans la requête
        if (isset($_GET['id_contrevenant'])) {
            $id_contrevenant = intval($_GET['id_contrevenant']);

            // Requête SQL pour sélectionner les informations du contrevenant
            $sql = "
                SELECT 
                    c.contrevenant
             
                FROM 
                    contrevenant c
                INNER JOIN 
                    courrier cr 
                ON 
                    c.id_contrevenant = cr.id_contrevenant
                WHERE 
                    cr.id_contrevenant = :id_contrevenant
            ";

            $stmt = $bdd->prepare($sql);
            $stmt->bindParam(':id_contrevenant', $id_contrevenant, PDO::PARAM_INT);
            $stmt->execute();
            $contrevenant = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($contrevenant) {
                header("Content-type: application/json");
                echo json_encode(array("status" => "success", "contrevenant" => $contrevenant));
            } else {
                throw new Exception("Aucun contrevenant trouvé pour l'ID spécifié.");
            }
        } else {
            throw new Exception("Paramètre id_contrevenant manquant.");
        }
    } catch (PDOException $e) {
        header("Content-type: application/json");
        echo json_encode(array("status" => "error", "message" => "Erreur lors de la récupération des contrevenants : " . $e->getMessage()));
    } catch (Exception $e) {
        header("Content-type: application/json");
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }
} else {
    header("Content-type: application/json");
    echo json_encode(array("status" => "error", "message" => "Accès non autorisé."));
}
?>
