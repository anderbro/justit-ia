<?php
session_start();
include("../../bd.php");

// Vérifier si l'ID du dossier est présent dans la requête
if (isset($_GET['id'])) {
    $bdd = getBD();
    $dossierId = $_GET['id'];
    $sql = "SELECT id_pv,dossier.id_dossier,pv_reference,pv_contrevenant,pv_date,pv_infraction,pv_correspondant,pv_commune,pv_obs,pv_detruit,pv_enjeux,pv_type,pv_parcelle_prin,pv_parcelles_autres
,pv_zone,pv_cabanisation,pv_infra_obs    FROM signalement_pv,dossier WHERE dossier.id_dossier = signalement_pv.id_dossier_1 AND dossier.id_dossier=:dossierId";


    error_log('Avant la requête SQL');

    $stmt = $bdd->prepare($sql);
    $stmt->bindParam(':dossierId', $dossierId, PDO::PARAM_INT);
    $stmt->execute();




    // Récupérer les données d'infractions
    $infractions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $bdd = null;

    error_log('Résultat de $contrevenants:');
    error_log(print_r($infractions, true));

    // Convertir le résultat en JSON et l'afficher
    echo json_encode(['infractions' => $infractions]);
} else {
    // Si l'ID du dossier n'est pas présent dans la requête, renvoyer une réponse d'erreur
    http_response_code(400);
    echo json_encode(['message' => 'ID de dossier manquant dans la requête']);
}
?>