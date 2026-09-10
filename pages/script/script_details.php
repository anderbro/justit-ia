<?php
session_start();
include ("../../bd.php");

$Id = isset($_POST['id']) ? $_POST['id'] : null;
$type = isset($_POST['type']) ? $_POST['type'] : null;

if ($Id !== null) {
    try {
        $bdd = getBD();

        if ($type === 'dossier') {
            // Recherche dans la table dossier
            // $sql = "SELECT a.*,b.*,c.*,d.*,e.* from dossier as a
            // join cour_cassation as b on b.id_dossier=a.num_dossier
            // join cours_appel as c on c.id_dossier=a.num_dossier
            // join tribunal_correctionnel as d on d.id_dossier=a.num_dossier
            // LEFT join signalement_pv as e on e.id_dossier=a.num_dossier
            // where a.id_dossier= :Id;";

            $sql = "SELECT a.* from dossier as a
            where a.id_dossier= :Id;";


        } elseif ($type === 'pv') {
            // Recherche dans la table signalement_pv
            $sql = "SELECT * FROM signalement_pv WHERE id_pv = :Id";

        } else {
            // Type non reconnu
            header('Content-Type: application/json');
            echo json_encode(array('error' => 'Type non reconnu.'));
            exit();
        }


        // Ajout de la requête pour récupérer les contrevenants



        $stmt = $bdd->prepare($sql);
        $stmt->bindParam(':Id', $Id, PDO::PARAM_INT);
        $stmt->execute();

        $details = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Vérification du rôle admin
        $isAdmin = isset($_SESSION['utilisateur']['nom_role']) && $_SESSION['utilisateur']['nom_role'] === 'admin';

        // Récupérer des informations de session
        $role = $_SESSION['utilisateur']['nom_role']; // Assurez-vous d'adapter cela à votre structure de session
        // $username = $_SESSION['utilisateur']['username']; // Assurez-vous d'adapter cela à votre structure de session


        $bdd = null;
        // error_log('Résultat de $details:');
        // error_log(print_r($details, true));

        header('Content-Type: application/json');
        echo json_encode(array('details' => $details, 'isAdmin' => $isAdmin, 'role' => $role));
    } catch (PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => 'Erreur lors de la récupération des détails.'));
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Identifiant non fourni.'));
}

// if ($type === 'contrevenants') {
//     $sql = "SELECT c.* FROM contrevenant AS c 
//             JOIN appartiens_dossier AS ad ON c.id = ad.id_contrevenant 
//             WHERE ad.id_dossier = :Id";
//     // Exécutez la requête et préparez les données à renvoyer
// }

?>