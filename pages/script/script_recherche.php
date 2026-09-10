<?php
// Inclure votre fichier de connexion à la base de données si nécessaire
include("../../bd.php");
$bdd = getBD();

if (isset($_POST['search_keyword'])) {
    $search_keyword = $_POST['search_keyword'];
    $results = [];

    // Première requête pour la table 'dossier'
    // $sqlDossier = "SELECT 'dossier' as source, d.*, c.contrevenant FROM dossier d
    //         INNER JOIN appartiens_dossier dc ON d.id_dossier = dc.id_dossier
    //         INNER JOIN contrevenant c ON dc.id_contrevenant = c.id
    //         WHERE d.num_dossier LIKE :keyword
    //         OR d.commune LIKE :keyword
    //         OR c.contrevenant LIKE :keyword
    //         OR d.n_soit_transmis LIKE :keyword";

    // Première requête pour la table 'dossier'
    $sqlDossier = "SELECT  DISTINCT 'dossier' as source, d.*, c.contrevenant FROM dossier d
            LEFT JOIN appartiens_dossier dc ON d.id_dossier = dc.id_dossier
            LEFT JOIN contrevenant c ON dc.id_contrevenant = c.id_contrevenant
            WHERE d.num_dossier LIKE :keyword
            OR d.commune LIKE :keyword
            OR c.contrevenant LIKE :keyword
            -- OR d.n_soit_transmis LIKE :keyword
            ";
    // $sqlDossier = "SELECT DISTINCT 'dossier' as source, d.*, c.contrevenant FROM dossier d
    // LEFT JOIN appartiens_dossier dc ON d.id_dossier = dc.id_dossier
    // LEFT JOIN contrevenant c ON dc.id_contrevenant = c.id_contrevenant
    // WHERE d.num_dossier LIKE :keyword
    // OR d.commune LIKE :keyword
    // OR c.contrevenant LIKE :keyword";


    $stmtDossier = $bdd->prepare($sqlDossier);
    $search_param = '%' . $search_keyword . '%';
    $stmtDossier->bindParam(':keyword', $search_param, PDO::PARAM_STR);
    $stmtDossier->execute();

    if ($stmtDossier->rowCount() > 0) {
        $results = array_merge($results, $stmtDossier->fetchAll(PDO::FETCH_ASSOC));
    }

    // Deuxième requête pour la table 'pv'
    $sqlPV = "SELECT 'signalement_pv' as source, p.* FROM signalement_pv p
        WHERE p.id_pv LIKE :keyword
        OR p.pv_commune LIKE :keyword
        OR p.pv_contrevenant LIKE :keyword";


    $stmtPV = $bdd->prepare($sqlPV);
    $stmtPV->bindParam(':keyword', $search_param, PDO::PARAM_STR);
    $stmtPV->execute();

    if ($stmtPV->rowCount() > 0) {
        $results = array_merge($results, $stmtPV->fetchAll(PDO::FETCH_ASSOC));
    }

    if (!empty($results)) {
        // Ajouter une pagination ici
        $perPage = 10;
        $currentPage = isset($_POST['page']) ? $_POST['page'] : 1;
        $offset = ($currentPage - 1) * $perPage;
        $paginatedResults = array_slice($results, $offset, $perPage);

        echo json_encode([
            'totalResults' => count($results),
            'results' => $paginatedResults,
        ]);
    } else {
        echo json_encode([]);
    }

    // Fermez les curseurs et libérez les ressources
    $stmtDossier->closeCursor();
    $stmtPV->closeCursor();
} else {
    echo json_encode([]);
}
?>