<?php
session_start();
include ("../../../bd.php");

// Vérifier si l'ID du dossier est présent dans la requête
if (isset($_GET['id'])) {
    $bdd = getBD();
    $dossierId = $_GET['id'];
    $sql = "SELECT signalement_pv.id_pv,
    dossier.id_dossier,
    pv_reference,
    pv_contrevenant,
    pv_date,
    pv_infraction,
    pv_correspondant,
    pv_commune,
    pv_obs,
    pv_detruit,
    pv_enjeux,
    pv_type,
    pv_parcelle_prin,
    pv_parcelles_autres,
    pv_zonage,
    pv_cabanisation,
    pv_infra_obs,
    pv_arrondissement,
    GROUP_CONCAT(natinf.id_natinf) AS natinf_ids,  -- Concatenate natinf IDs
    GROUP_CONCAT(natinf.Num) AS natinf_nums         -- Concatenate natinf numbers
FROM signalement_pv
INNER JOIN dossier ON dossier.id_dossier = signalement_pv.id_dossier_1
LEFT JOIN appartiens_natinf_infra ON appartiens_natinf_infra.id_pv = signalement_pv.id_pv
LEFT JOIN natinf ON appartiens_natinf_infra.id_natinf = natinf.id_natinf
WHERE dossier.id_dossier = :dossierId
GROUP BY signalement_pv.id_pv;";


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