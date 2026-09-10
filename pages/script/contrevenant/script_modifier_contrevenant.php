<?php
session_start();
include("../../../bd.php");

try {
    // Connexion à la base de données
    $bdd = getBD();

    // Vérifiez que l'ID du contrevenant est présent dans les données POST
    if (!isset($_POST['id']) || empty($_POST['id'])) {
        throw new Exception("ID du contrevenant manquant.");
    }
    $contrevenantId = $_POST['id'];

    // Logging des données reçues (utile pour le débogage)
    error_log("FormData recu : " . print_r($_POST, true));
    error_log("Id reçu : " . $contrevenantId);

    // Construction de la requête SQL pour mettre à jour les champs dans la table 'contrevenant'
    $queryContrevenant = "UPDATE contrevenant SET ";
    $paramsContrevenant = [];
    foreach ($_POST as $key => $value) {
        if ($key !== 'id' && $key !== 'statut') { // Ignorer les clés 'id' et 'statut'
            $queryContrevenant .= "$key = :$key, ";
            $paramsContrevenant[":$key"] = $value;
        }
    }
    $queryContrevenant = rtrim($queryContrevenant, ', '); // Supprimer la virgule finale
    $queryContrevenant .= " WHERE id_contrevenant = :id";
    $stmtContrevenant = $bdd->prepare($queryContrevenant);

    // Associer les valeurs aux paramètres pour la table 'contrevenant'
    foreach ($paramsContrevenant as $param => &$val) {
        $stmtContrevenant->bindParam($param, $val);
    }
    $stmtContrevenant->bindParam(':id', $contrevenantId);
    $stmtContrevenant->execute();

    // Vérifiez si le statut est présent dans les données POST
    if (!isset($_POST['statut'])) {
        throw new Exception("Statut manquant.");
    }
    $statut = $_POST['statut'];

    // Construction de la requête SQL pour mettre à jour le champ id_statut_contrevenant dans la table 'a_le_statut_con'
    $queryALeStatut = "UPDATE a_le_statut_con SET id_statut_contrevenant = :statut WHERE id_contrevenant = :id";
    $stmtALeStatut = $bdd->prepare($queryALeStatut);
    $stmtALeStatut->bindParam(':statut', $statut, PDO::PARAM_INT);
    $stmtALeStatut->bindParam(':id', $contrevenantId, PDO::PARAM_INT);
    $stmtALeStatut->execute();

    // Répondre avec un succès
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // En cas d'erreur, renvoyer une réponse d'échec avec un message d'erreur
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
