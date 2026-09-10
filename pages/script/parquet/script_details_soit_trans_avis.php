<?php
session_start();
include ("../../../bd.php");

$id_dossier = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id_dossier <= 0) {
    echo json_encode(['error' => 'Invalid dossier ID']);
    exit;
}


try {
    $pdo = getBD();
    // SQL query for soit_transmis
    $sql_soit_transmis = "SELECT
    st.id_soit_transmis,
    st.soit_trans_numero,
    st.soit_trans_damande_parquet,
    st.soit_trans_date_premiere_audition,
    st.soit_trans_date_limite_enquete,
    st.soit_trans_priorite,
    st.soit_trans_traite,
    st.soit_trans_observation,
    st.id_parquet,
    st.id_dossier,
    st.soit_trans_date,
    p.parquet  -- Ajout du champ parquet depuis la table parquet
FROM
    soit_transmis st
LEFT JOIN
    parquet p ON st.id_parquet = p.id_parquet  -- Jointure avec la table parquet
WHERE
    st.id_dossier = :id_dossier";

    // SQL query for avis
    $sql_avis = "SELECT
    a.id_avis,
    a.avis_conclusion,
    a.avis_observations,
    a.avis_date,
    st.soit_trans_numero,
    p.parquet
FROM
    avis a
INNER JOIN
    fais_objet fo ON a.id_avis = fo.id_avis
INNER JOIN
    soit_transmis st ON fo.id_soit_transmis = st.id_soit_transmis
LEFT JOIN
    parquet p ON st.id_parquet = p.id_parquet
WHERE
    st.id_dossier = :id_dossier";



    // Prepare and execute the queries
    $stmt_soit_transmis = $pdo->prepare($sql_soit_transmis);
    $stmt_soit_transmis->bindParam(':id_dossier', $id_dossier, PDO::PARAM_INT);
    $stmt_soit_transmis->execute();
    $soitTransmis = $stmt_soit_transmis->fetchAll();

    $stmt_avis = $pdo->prepare($sql_avis);
    $stmt_avis->bindParam(':id_dossier', $id_dossier, PDO::PARAM_INT);
    $stmt_avis->execute();
    $avis = $stmt_avis->fetchAll();

    // Vérification que les résultats sont bien des tableaux
    if (!is_array($soitTransmis)) {
        $soitTransmis = [];
    }
    if (!is_array($avis)) {
        $avis = [];
    }

    // Debug: Imprimer les données pour vérifier la sortie
    // Vous pouvez supprimer ces lignes après le débogage
    // error_log(print_r($soitTransmis, true));
    // error_log(print_r($avis, true));
    header('Content-Type: application/json');

    // Return the results as JSON
    echo json_encode([
        'soitTransmis' => $soitTransmis,
        'avis' => $avis
    ]);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>