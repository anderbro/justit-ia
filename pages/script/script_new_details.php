
<?php
function getNumDossier($idDossier) {
    include '../bd.php';
    $bdd = getBD();

    $stmt = $bdd->prepare("SELECT * 
                           FROM dossier 
                           LEFT JOIN contrevenant ON dossier.id_dossier = contrevenant.id 
                           WHERE dossier.id_dossier = :idDossier");
    $stmt->bindParam(':idDossier', $idDossier, PDO::PARAM_INT);
    

    $stmt->execute();

    if ($stmt->rowCount() > 0) {

        $row = $stmt->fetch();
        // Stockage des valeurs dans un tableau
        return [
            'num_dossier' => $row['num_dossier'],
            'n_soit_transmis' => $row['n_soit_transmis'],
            'parcelle_princ' => $row['parcelle_princ'],
            'description_des_faits' => $row['description_des_faits'],
            'contrevenant' => $row['contrevenant'],
            'commune' => $row['commune'],
            'complement_parcelle' => $row['complement_parcelle']
        ];
    } else {
        return [
            'num_dossier' => "Aucun dossier trouvé pour l'ID: $idDossier",
            'n_soit_transmis' => null,
            'parcelle_princ' => null,
            'description_des_faits' => null,
            'contrevenant' => null,
            'commune' => null,
            'complement_parcelle' => null
        ];
    }
}


$dossierId = isset($_GET['id']) ? $_GET['id'] : '';


$resultat = getNumDossier($dossierId);

// Affichage des résultats
$numDossier = $resultat['num_dossier'];
$nSoitTransmis = $resultat['n_soit_transmis'];
$parcellePrinc = $resultat['parcelle_princ'];
$descriptionDesFaits = $resultat['description_des_faits'];
$contrevenant = $resultat['contrevenant']; 
$commune = $resultat['commune'];
$complParcelle = $resultat['complement_parcelle']


?>
