<?php
  include("./bd.php");
  $bdd = getBD();
if (isset($_POST['search_by_keyword'])) {
    $search_keyword = $_POST['keyword'];

    if (!empty($search_keyword)) {
        try {
            
            // $bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $sql = "SELECT d.*, c.contrevenant FROM dossier d
                    INNER JOIN appartiens_dossier dc ON d.id_dossier = dc.id_dossier
                    INNER JOIN contrevenant c ON dc.id_contrevenant = c.id_contrevenant
                    WHERE d.num_dossier LIKE :keyword
                    OR d.commune LIKE :keyword
                    OR c.contrevenant LIKE :keyword
                    OR d.n_soit_transmis LIKE :keyword";

            $stmt = $bdd->prepare($sql);
            $search_param = '%' . $search_keyword . '%';
            $stmt->bindParam(':keyword', $search_param, PDO::PARAM_STR);
            $stmt->execute();

            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($results) > 0) {
                echo json_encode(['success' => true, 'data' => $results]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Aucun résultat trouvé.']);
            }

            $stmt->closeCursor();
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Une erreur s\'est produite lors de la recherche.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Le champ de recherche est vide. Veuillez entrer un mot-clé pour effectuer la recherche.']);
    }
}
?>
