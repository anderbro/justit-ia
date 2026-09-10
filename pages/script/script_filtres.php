<?php
session_start();
include("../../bd.php");

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['utilisateur'])) {
    echo json_encode(array('error' => 'Non authentifié.'));
    exit();
}

try {
    $bdd = getBD();

    $communesStmt = $bdd->query(
        "SELECT commune FROM comm_arr
         UNION
         SELECT DISTINCT commune FROM dossier WHERE commune IS NOT NULL AND commune <> ''
         ORDER BY commune ASC"
    );
    $communes = $communesStmt->fetchAll(PDO::FETCH_COLUMN);

    $anneesStmt = $bdd->query(
        "SELECT DISTINCT annee FROM (
            SELECT YEAR(date_du_soit_transmis) AS annee
            FROM dossier
            WHERE date_du_soit_transmis IS NOT NULL
            UNION
            SELECT CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(num_dossier, '-', 2), '-', -1) AS UNSIGNED) AS annee
            FROM dossier
            WHERE num_dossier REGEXP '^[A-Za-z]+-[0-9]{4}'
         ) AS years
         WHERE annee IS NOT NULL AND annee >= 1990 AND annee <= 2100
         ORDER BY annee DESC"
    );
    $annees = array_map('intval', $anneesStmt->fetchAll(PDO::FETCH_COLUMN));
    $currentYear = (int) date('Y');
    if (!in_array($currentYear, $annees, true)) {
        array_unshift($annees, $currentYear);
    }

    $contrevenantsStmt = $bdd->query(
        "SELECT id_contrevenant,
                COALESCE(
                    NULLIF(TRIM(CONCAT(IFNULL(prenom, ''), ' ', IFNULL(nom, ''))), ''),
                    contrevenant
                ) AS label
         FROM contrevenant
         ORDER BY label ASC"
    );
    $contrevenants = $contrevenantsStmt->fetchAll(PDO::FETCH_ASSOC);

    $prioritesStmt = $bdd->query(
        "SELECT DISTINCT priorite FROM dossier
         WHERE priorite IS NOT NULL AND priorite <> ''
         ORDER BY priorite ASC"
    );
    $priorites = $prioritesStmt->fetchAll(PDO::FETCH_COLUMN);
    foreach (array('P1', 'P2', 'P3') as $defaultPriorite) {
        if (!in_array($defaultPriorite, $priorites, true)) {
            $priorites[] = $defaultPriorite;
        }
    }
    sort($priorites);

    echo json_encode(array(
        'communes' => $communes,
        'annees' => $annees,
        'contrevenants' => $contrevenants,
        'priorites' => $priorites,
    ));
} catch (PDOException $e) {
    echo json_encode(array('error' => 'Impossible de charger les filtres.'));
}
