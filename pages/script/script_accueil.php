<?php
session_start();
include("../../bd.php");

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['utilisateur'])) {
    echo json_encode(array('error' => 'Non authentifié.'));
    exit();
}

$commune = isset($_GET['commune']) ? trim($_GET['commune']) : '';
$annee = isset($_GET['annee']) ? trim($_GET['annee']) : '';
$contrevenantId = isset($_GET['contrevenant']) ? trim($_GET['contrevenant']) : '';
$priorite = isset($_GET['priorite']) ? trim($_GET['priorite']) : '';
$cabanisation = isset($_GET['cabanisation']) ? trim($_GET['cabanisation']) : '';
$sensible = isset($_GET['sensible']) ? trim($_GET['sensible']) : '';
$archivage = isset($_GET['archivage']) ? trim($_GET['archivage']) : '';
$keyword = isset($_GET['q']) ? trim($_GET['q']) : '';

try {
    $bdd = getBD();

    $sql = "SELECT
                d.id_dossier,
                d.num_dossier,
                d.commune,
                d.date_du_soit_transmis,
                d.priorite,
                d.cabanisation,
                d.dossier_sensible,
                d.archivage,
                d.prescription,
                GROUP_CONCAT(DISTINCT
                    COALESCE(
                        NULLIF(TRIM(CONCAT(IFNULL(c.prenom, ''), ' ', IFNULL(c.nom, ''))), ''),
                        c.contrevenant
                    ) SEPARATOR ', '
                ) AS contrevenant
            FROM dossier d
            LEFT JOIN appartiens_dossier ad ON ad.id_dossier = d.id_dossier
            LEFT JOIN contrevenant c ON c.id_contrevenant = ad.id_contrevenant
            WHERE 1 = 1";

    $params = array();

    if ($commune !== '') {
        $sql .= " AND d.commune = :commune";
        $params[':commune'] = $commune;
    }

    if ($annee !== '' && ctype_digit($annee)) {
        $sql .= " AND (
            YEAR(d.date_du_soit_transmis) = :annee
            OR d.num_dossier LIKE :anneeLike
        )";
        $params[':annee'] = (int) $annee;
        $params[':anneeLike'] = '%-' . $annee . '-%';
    }

    if ($contrevenantId !== '' && ctype_digit($contrevenantId)) {
        $sql .= " AND c.id_contrevenant = :contrevenant";
        $params[':contrevenant'] = (int) $contrevenantId;
    }

    if ($priorite !== '') {
        $sql .= " AND d.priorite = :priorite";
        $params[':priorite'] = $priorite;
    }

    if ($cabanisation === 'oui') {
        $sql .= " AND d.cabanisation IN ('oui', 'Oui', 'X', '1')";
    } elseif ($cabanisation === 'non') {
        $sql .= " AND (d.cabanisation IS NULL OR d.cabanisation IN ('', 'non', 'Non', '0'))";
    }

    if ($sensible === '1' || $sensible === '0') {
        $sql .= " AND IFNULL(d.dossier_sensible, 0) = :sensible";
        $params[':sensible'] = (int) $sensible;
    }

    if ($archivage === '1' || $archivage === '0') {
        $sql .= " AND IFNULL(d.archivage, 0) = :archivage";
        $params[':archivage'] = (int) $archivage;
    }

    if ($keyword !== '') {
        $sql .= " AND (
            d.num_dossier LIKE :keyword
            OR d.commune LIKE :keyword
            OR c.nom LIKE :keyword
            OR c.prenom LIKE :keyword
            OR c.contrevenant LIKE :keyword
        )";
        $params[':keyword'] = '%' . $keyword . '%';
    }

    $sql .= " GROUP BY d.id_dossier ORDER BY d.id_dossier DESC LIMIT 100";

    $stmt = $bdd->prepare($sql);
    $stmt->execute($params);
    $dossiers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($dossiers);
} catch (PDOException $e) {
    echo json_encode(array('error' => 'Erreur lors de la récupération des dossiers.'));
}
