<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'utilisateur est connecté en tant qu'admin
if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer l'id_dossier depuis les paramètres GET
        if (isset($_GET['id_dossier']) && !empty($_GET['id_dossier'])) {
            $idDossier = filter_input(INPUT_GET, 'id_dossier', FILTER_SANITIZE_NUMBER_INT);

            if ($idDossier) {
                // Récupérer les courriers liés à l'id_dossier et joindre les informations des contrevenants
                $sqlCourriers = "
                    SELECT c.*, cn.nom , cn.prenom 
                    FROM courrier c
                    LEFT JOIN contrevenant cn ON c.id_contrevenant = cn.id_contrevenant
                    WHERE c.id_dossier = :id_dossier";
                $stmtCourriers = $bdd->prepare($sqlCourriers);
                $stmtCourriers->bindParam(':id_dossier', $idDossier, PDO::PARAM_INT);
                $stmtCourriers->execute();
                $courriers = $stmtCourriers->fetchAll(PDO::FETCH_ASSOC);

                // Retourner les courriers en format JSON
                header("Content-type: application/json");
                echo json_encode(array("status" => "success", "courriers" => $courriers));
            } else {
                throw new Exception("Paramètre id_dossier invalide.");
            }
        } else {
            throw new Exception("Paramètre id_dossier manquant.");
        }
    } catch (PDOException $e) {
        header("Content-type: application/json");
        echo json_encode(array("status" => "error", "message" => "Erreur lors de la récupération des courriers : " . $e->getMessage()));
    } catch (Exception $e) {
        header("Content-type: application/json");
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    } finally {
        $bdd = null; // Fermer explicitement la connexion à la base de données
    }
} else {
    header("Content-type: application/json");
    echo json_encode(array("status" => "error", "message" => "Accès non autorisé."));
}
?>
