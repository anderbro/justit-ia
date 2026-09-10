<?php
session_start();
include("../../bd.php");

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['utilisateur'])) {
    echo json_encode(array('success' => false, 'error' => 'Non authentifié.'));
    exit();
}

function postValue($key)
{
    if (!isset($_POST[$key])) {
        return null;
    }
    $value = trim($_POST[$key]);
    return $value === '' ? null : $value;
}

function isOui($key)
{
    return isset($_POST[$key]) && $_POST[$key] === 'Oui';
}

$numeroDossier = postValue('numero_dossier');
$priorite = postValue('priorite');
$commune = postValue('commune');
$dateSoitTransmis = postValue('date_du_soit_transmis');
$dateCourrier = postValue('date_courrier');
$parcellePrincipale = postValue('parcelle_principale');
$parcellesSecondaires = postValue('parcelles_secondaires');
$observations = postValue('observations');
$detruit = isOui('detruit') ? 'X' : null;
$cabanisation = isOui('cabanisation') ? 'oui' : null;
$dossierSensible = isOui('dossier_sensible') ? 1 : 0;

if ($numeroDossier === null) {
    echo json_encode(array('success' => false, 'error' => 'Le numéro de dossier est obligatoire.'));
    exit();
}

try {
    $bdd = getBD();

    $stmtCheck = $bdd->prepare("SELECT COUNT(*) AS count FROM dossier WHERE num_dossier = :num_dossier");
    $stmtCheck->execute(array(':num_dossier' => $numeroDossier));
    $alreadyExists = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if ($alreadyExists && (int) $alreadyExists['count'] > 0) {
        echo json_encode(array('success' => false, 'error' => 'Ce numéro de dossier existe déjà.'));
        exit();
    }

    $sql = "INSERT INTO dossier (
                num_dossier,
                priorite,
                commune,
                detruit,
                cabanisation,
                date_du_soit_transmis,
                date_courrier_info,
                parcelle_princ,
                parcelles_avoisinantes,
                dossier_sensible,
                obs_dossier
            ) VALUES (
                :num_dossier,
                :priorite,
                :commune,
                :detruit,
                :cabanisation,
                :date_soit_transmis,
                :date_courrier,
                :parcelle_principale,
                :parcelles_secondaires,
                :dossier_sensible,
                :observations
            )";

    $stmt = $bdd->prepare($sql);
    $stmt->execute(array(
        ':num_dossier' => $numeroDossier,
        ':priorite' => $priorite,
        ':commune' => $commune,
        ':detruit' => $detruit,
        ':cabanisation' => $cabanisation,
        ':date_soit_transmis' => $dateSoitTransmis,
        ':date_courrier' => $dateCourrier,
        ':parcelle_principale' => $parcellePrincipale,
        ':parcelles_secondaires' => $parcellesSecondaires,
        ':dossier_sensible' => $dossierSensible,
        ':observations' => $observations,
    ));

    $idDossier = $bdd->lastInsertId();

    try {
        $related = $bdd->prepare("INSERT IGNORE INTO tribunal_correctionnel (id_dossier) VALUES (:id)");
        $related->execute(array(':id' => $numeroDossier));
        $related = $bdd->prepare("INSERT IGNORE INTO cours_appel (id_dossier) VALUES (:id)");
        $related->execute(array(':id' => $numeroDossier));
        $related = $bdd->prepare("INSERT IGNORE INTO cour_cassation (id_dossier) VALUES (:id)");
        $related->execute(array(':id' => $numeroDossier));
    } catch (PDOException $ignored) {
        // Les tables liées sont facultatives pour la création du dossier.
    }

    echo json_encode(array('success' => true, 'id' => $idDossier));
} catch (PDOException $e) {
    echo json_encode(array('success' => false, 'error' => 'Erreur lors de la création du dossier.'));
}
