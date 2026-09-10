<?php
session_start();
include("../../bd.php");

if (isset($_SESSION['utilisateur']) && $_SESSION['utilisateur']['nom_role'] == 'admin') {
    try {
        $bdd = getBD();

        // Récupérer le type de personne (physique ou morale)
        $type = isset($_GET['type']) ? $_GET['type'] : null;

        // Récupérer l'ID du dossier
        $idDossier = isset($_POST['id_dossier']) ? $_POST['id_dossier'] : null;

        // Initialiser un tableau associatif pour stocker les données à insérer
        $data = array();

        // En fonction du type, déterminer les champs nécessaires et les valeurs
        if ($type == 'Personne Physique') {
            $data['civilite'] = isset($_POST['civilite']) ? $_POST['civilite'] : null;
            $data['nom'] = isset($_POST['nom']) ? $_POST['nom'] : null;
            $data['prenom'] = isset($_POST['prenom']) ? $_POST['prenom'] : null;
            $data['date_naissance'] = isset($_POST['date_naissance']) ? $_POST['date_naissance'] : null;
            $data['lieu_naissance'] = isset($_POST['lieu_naissance']) ? $_POST['lieu_naissance'] : null;
            $data['adresse'] = isset($_POST['adresse']) ? $_POST['adresse'] : null;
            // $data['statut'] = isset($_POST['statut']) ? $_POST['statut'] : null;
        } elseif ($type == 'Personne Morale') {
            $data['nom'] = isset($_POST['nom']) ? $_POST['nom'] : null;
            $data['representant_legal'] = isset($_POST['representant_legal']) ? $_POST['representant_legal'] : null;
            $data['adresse_siege'] = isset($_POST['adresse_siege']) ? $_POST['adresse_siege'] : null;
            $data['SIRET_SIREN'] = isset($_POST['SIRET_SIREN']) ? $_POST['SIRET_SIREN'] : null;
            // $data['statut'] = isset($_POST['statut']) ? $_POST['statut'] : null;
        } else {
            // Type non reconnu
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'Type non reconnu.'));
            exit();
        }

        // Parcourir le tableau $data et remplacer les valeurs vides par NULL
        foreach ($data as $key => $value) {
            if ($value === "") {
                $data[$key] = null;
            }
        }

        // Construction de la requête SQL en fonction du type
        if ($type == 'Personne Physique') {
            $sql = "INSERT INTO contrevenant (civilite, nom, prenom, date_naissance, lieu_naissance, adresse) 
            VALUES (:civilite, :nom, :prenom, :date_naissance, :lieu_naissance, :adresse)";
        } elseif ($type == 'Personne Morale') {
            $sql = "INSERT INTO contrevenant (nom, representant_legal, adresse_siege, SIRET_SIREN) 
            VALUES (:nom, :representant_legal, :adresse_siege, :SIRET_SIREN)";
        }

        // Préparation de la requête SQL
        $stmt = $bdd->prepare($sql);

        // Liaison des paramètres
        foreach ($data as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        // Affichage de la requête SQL dans les logs
        // error_log("Requête SQL : " . $stmt->queryString);

        // Exécution de la requête
        $stmt->execute();

        // error_log("Requête SQL finie");

        // Récupérer l'ID du statut du contrevenant
        // $idStatutContrevenant = isset($data['id_statut_contrevenant']) ? $data['id_statut_contrevenant'] : 2; 
        // $idStatutContrevenant = isset($_POST['id_statut_contrevenant']) ? $_POST['id_statut_contrevenant'] : 2;
        $idStatutContrevenant = isset($_POST['statut']) ? $_POST['statut'] : null;
        // $idStatutContrevenant = isset($data['statut']) ? $data['statut'] : 2;

        $idContrevenant = $bdd->lastInsertId();



        // error_log("statut conrevenant =" . $idStatutContrevenant);
        // error_log("id dossier=" . $idDossier);
        // error_log("id contrevenant=" . $idContrevenant);

        // Vérifiez si l'ID du statut du contrevenant est défini
        if ($idStatutContrevenant !== null) {
            // Insérez maintenant l'ID du contrevenant, l'ID du dossier et l'ID du statut dans la table intermédiaire `a_le_statut_con`
            $sqlInsertStatut = "INSERT INTO a_le_statut_con (id_contrevenant, id_dossier, id_statut_contrevenant) VALUES (:id_contrevenant, :id_dossier, :id_statut)";
            $stmtInsertStatut = $bdd->prepare($sqlInsertStatut);

            // Liaison des paramètres
            $stmtInsertStatut->bindParam(':id_contrevenant', $idContrevenant);
            $stmtInsertStatut->bindParam(':id_dossier', $idDossier);
            $stmtInsertStatut->bindParam(':id_statut', $idStatutContrevenant);

            // Exécution de la requête
            $stmtInsertStatut->execute();
            // error_log("wtf");
        } else {
            error_log("ID du statut du contrevenant non défini.");
        }

        // Récupérer l'ID du dossier depuis la requête POST
        $idDossier = isset($_POST['id_dossier']) ? $_POST['id_dossier'] : null;

        // Vérifier si l'ID du dossier est valide
        if ($idDossier !== null) {
            try {
                // ... votre code existant pour l'insertion du contrevenant ...

                // Insertion dans la table appartiens_dossier
                $sqlInsertAppartiensDossier = "INSERT INTO appartiens_dossier (id_contrevenant, id_dossier) VALUES (:id_contrevenant, :id_dossier)";
                $stmtInsertAppartiensDossier = $bdd->prepare($sqlInsertAppartiensDossier);
                $stmtInsertAppartiensDossier->bindParam(':id_contrevenant', $idContrevenant);
                $stmtInsertAppartiensDossier->bindParam(':id_dossier', $idDossier);
                $stmtInsertAppartiensDossier->execute();

            } catch (PDOException $e) {
                header('Content-Type: application/json');
                echo json_encode(array('error' => 'Erreur lors de l\'insertion dans appartiens_dossier. ' . $e->getMessage()));
                exit(); // Assurez-vous de sortir du script en cas d'erreur
            }
        } else {
            // Si l'ID du dossier est manquant, retourner une erreur JSON
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'ID du dossier manquant.'));
            exit(); // Sortir du script si l'ID du dossier est manquant
        }

        // Fermeture de la connexion à la base de données
        $bdd = null;

        header('Content-Type: application/json');
        echo json_encode(array('success' => true));
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de l\'insertion du contrevenant SQL. ' . $e->getMessage()));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Accès non autorisé.'));
}
?>