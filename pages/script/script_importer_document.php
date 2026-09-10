<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include(__DIR__ . '/../../bd.php');

if (!isset($_SESSION['utilisateur'])) {
    echo json_encode(array('success' => false, 'error' => 'Non authentifié.'));
    exit();
}

$idDossier = isset($_POST['id_dossier']) ? (int) $_POST['id_dossier'] : 0;
if ($idDossier <= 0) {
    echo json_encode(array('success' => false, 'error' => 'Identifiant de dossier manquant.'));
    exit();
}

if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(array('success' => false, 'error' => 'Veuillez déposer un PDF ou une image lisible.'));
    exit();
}

$file = $_FILES['document'];
$allowedExt = array('pdf', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'webp');
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($extension, $allowedExt, true)) {
    echo json_encode(array('success' => false, 'error' => 'Format non pris en charge. Utilisez un PDF ou une image.'));
    exit();
}

function import_null($value)
{
    if ($value === null) {
        return null;
    }
    $value = trim((string) $value);
    return $value === '' ? null : $value;
}

function import_date($value)
{
    $value = import_null($value);
    if ($value === null) {
        return null;
    }
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return $value;
    }
    foreach (array('d/m/Y', 'd-m-Y', 'd.m.Y') as $format) {
        $parsed = DateTime::createFromFormat($format, $value);
        if ($parsed instanceof DateTime) {
            return $parsed->format('Y-m-d');
        }
    }
    return null;
}

function import_yes($value)
{
    $normalized = strtolower(trim((string) $value));
    return in_array($normalized, array('oui', 'yes', 'true', '1', 'x'), true);
}

function import_exists(PDO $bdd, $sql, $params)
{
    $stmt = $bdd->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchColumn();
}

function import_find_parquet_id(PDO $bdd, $name)
{
    $name = trim((string) $name);
    if ($name === '') {
        $name = 'Montpellier';
    }
    $stmt = $bdd->prepare("SELECT id_parquet FROM parquet WHERE parquet LIKE :name ORDER BY id_parquet ASC LIMIT 1");
    $stmt->execute(array(':name' => '%' . $name . '%'));
    $id = $stmt->fetchColumn();
    if ($id) {
        return (int) $id;
    }
    $stmt = $bdd->query("SELECT id_parquet FROM parquet ORDER BY id_parquet ASC LIMIT 1");
    return (int) $stmt->fetchColumn();
}

function import_find_agent_id(PDO $bdd, $name)
{
    $name = trim((string) $name);
    if ($name !== '') {
        $stmt = $bdd->prepare(
            "SELECT id FROM agent
             WHERE CONCAT(agent_prenom, ' ', agent_nom) LIKE :full
                OR CONCAT(agent_nom, ' ', agent_prenom) LIKE :full2
                OR agent_nom LIKE :nom
             LIMIT 1"
        );
        $stmt->execute(array(
            ':full' => '%' . $name . '%',
            ':full2' => '%' . $name . '%',
            ':nom' => '%' . $name . '%',
        ));
        $id = $stmt->fetchColumn();
        if ($id) {
            return (int) $id;
        }
    }
    $stmt = $bdd->query("SELECT id FROM agent WHERE agent_archive = 0 ORDER BY id ASC LIMIT 1");
    $id = $stmt->fetchColumn();
    return $id ? (int) $id : null;
}

function import_find_statut_id(PDO $bdd, $name)
{
    $name = trim((string) $name);
    if ($name !== '') {
        $stmt = $bdd->prepare("SELECT id_statut_contrevenant FROM statut_contrevenant WHERE nom_statut_contrevenant LIKE :name LIMIT 1");
        $stmt->execute(array(':name' => '%' . $name . '%'));
        $id = $stmt->fetchColumn();
        if ($id) {
            return (int) $id;
        }
    }
    return 1;
}

function import_natinf_ids(PDO $bdd, $codes)
{
    $ids = array();
    if (!is_array($codes)) {
        return $ids;
    }
    $select = $bdd->prepare("SELECT id_natinf FROM natinf WHERE Num = :num");
    $insert = $bdd->prepare("INSERT INTO natinf (Num) VALUES (:num)");
    foreach ($codes as $code) {
        $code = strtoupper(trim((string) $code));
        if ($code === '') {
            continue;
        }
        $select->execute(array(':num' => $code));
        $id = $select->fetchColumn();
        if (!$id) {
            $insert->execute(array(':num' => $code));
            $id = $bdd->lastInsertId();
        }
        if ($id) {
            $ids[] = (int) $id;
        }
    }
    return array_values(array_unique($ids));
}

function import_display_name($person)
{
    if (!is_array($person)) {
        return '';
    }
    if (!empty($person['type']) && $person['type'] === 'morale') {
        return trim((string) (isset($person['nom']) ? $person['nom'] : ''));
    }
    $parts = array_filter(array(
        isset($person['civilite']) ? $person['civilite'] : '',
        isset($person['prenom']) ? $person['prenom'] : '',
        isset($person['nom']) ? $person['nom'] : '',
    ));
    return trim(implode(' ', $parts));
}

$aiUrl = getenv('AI_URL') ?: 'http://ai:8000';
$communes = isset($_POST['communes']) ? $_POST['communes'] : '[]';
$mime = $file['type'] ?: 'application/octet-stream';
if (function_exists('finfo_open')) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo) {
        $detected = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        if ($detected) {
            $mime = $detected;
        }
    }
}

$curlFile = new CURLFile($file['tmp_name'], $mime, $file['name']);
$ch = curl_init($aiUrl . '/analyze');
curl_setopt_array($ch, array(
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => array(
        'document' => $curlFile,
        'communes' => $communes,
    ),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 120,
));
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false) {
    echo json_encode(array(
        'success' => false,
        'error' => 'Service IA injoignable. Vérifiez que le conteneur ai est démarré.',
        'detail' => $error,
    ));
    exit();
}

$decoded = json_decode($response, true);
if (!is_array($decoded) || empty($decoded['success'])) {
    $message = 'Analyse impossible.';
    if (is_array($decoded) && isset($decoded['error'])) {
        $message = $decoded['error'];
    } elseif (is_array($decoded) && isset($decoded['detail'])) {
        $message = is_string($decoded['detail']) ? $decoded['detail'] : $message;
    }
    echo json_encode(array('success' => false, 'error' => $message, 'status' => $status));
    exit();
}

$fields = isset($decoded['fields']) && is_array($decoded['fields']) ? $decoded['fields'] : array();
$entities = isset($decoded['entities']) && is_array($decoded['entities']) ? $decoded['entities'] : array();
$created = array(
    'dossier' => 0,
    'contrevenants' => 0,
    'infractions' => 0,
    'parquets' => 0,
    'avis' => 0,
    'audiences' => 0,
    'decisions' => 0,
    'recours' => 0,
    'courriers' => 0,
    'rapports' => 0,
    'requetes' => 0,
    'recouvrements' => 0,
    'procedures_liees' => 0,
);
$skipped = array();

try {
    $bdd = getBD();
    $bdd->beginTransaction();

    $dossierStmt = $bdd->prepare("SELECT * FROM dossier WHERE id_dossier = :id LIMIT 1");
    $dossierStmt->execute(array(':id' => $idDossier));
    $dossier = $dossierStmt->fetch(PDO::FETCH_ASSOC);
    if (!$dossier) {
        throw new Exception('Dossier introuvable.');
    }
    $numDossier = $dossier['num_dossier'];

    $obs = isset($fields['observations']) ? trim((string) $fields['observations']) : '';
    if ($obs !== '' && strpos((string) $dossier['obs_dossier'], $obs) !== false) {
        $obs = $dossier['obs_dossier'];
    } elseif ($obs !== '' && !empty($dossier['obs_dossier'])) {
        $obs = rtrim($dossier['obs_dossier']) . "\n" . $obs;
    } elseif ($obs === '') {
        $obs = $dossier['obs_dossier'];
    }

    $update = $bdd->prepare(
        "UPDATE dossier SET
            parcelle_princ = COALESCE(:parcelle, parcelle_princ),
            complement_parcelle = COALESCE(:parcelles, complement_parcelle),
            commune = COALESCE(:commune, commune),
            cabanisation = COALESCE(:cabanisation, cabanisation),
            dossier_sensible = :sensible,
            priorite = COALESCE(:priorite, priorite),
            date_du_soit_transmis = COALESCE(:date_st, date_du_soit_transmis),
            date_courrier_info = COALESCE(:date_courrier, date_courrier_info),
            detruit = COALESCE(:detruit, detruit),
            obs_dossier = :obs
         WHERE id_dossier = :id"
    );
    $update->execute(array(
        ':parcelle' => import_null(isset($fields['parcelle_principale']) ? $fields['parcelle_principale'] : null),
        ':parcelles' => import_null(isset($fields['parcelles_secondaires']) ? $fields['parcelles_secondaires'] : null),
        ':commune' => import_null(isset($fields['commune']) ? $fields['commune'] : null),
        ':cabanisation' => import_yes(isset($fields['cabanisation']) ? $fields['cabanisation'] : '') ? 'oui' : import_null(isset($fields['cabanisation']) ? $fields['cabanisation'] : null),
        ':sensible' => import_yes(isset($fields['dossier_sensible']) ? $fields['dossier_sensible'] : $dossier['dossier_sensible']) ? 1 : 0,
        ':priorite' => import_null(isset($fields['priorite']) ? $fields['priorite'] : null),
        ':date_st' => import_date(isset($fields['date_du_soit_transmis']) ? $fields['date_du_soit_transmis'] : null),
        ':date_courrier' => import_date(isset($fields['date_courrier']) ? $fields['date_courrier'] : null),
        ':detruit' => import_null(isset($fields['detruit']) ? $fields['detruit'] : null),
        ':obs' => $obs,
        ':id' => $idDossier,
    ));
    $created['dossier'] = 1;

    $contrevenantIds = array();
    $existingPeople = $bdd->prepare(
        "SELECT c.id_contrevenant, c.nom, c.prenom
         FROM contrevenant c
         INNER JOIN appartiens_dossier ad ON ad.id_contrevenant = c.id_contrevenant
         WHERE ad.id_dossier = :id"
    );
    $existingPeople->execute(array(':id' => $idDossier));
    foreach ($existingPeople->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $contrevenantIds[] = (int) $row['id_contrevenant'];
    }

    $people = isset($entities['contrevenants']) && is_array($entities['contrevenants']) ? $entities['contrevenants'] : array();
    foreach ($people as $person) {
        if (!is_array($person) || import_null(isset($person['nom']) ? $person['nom'] : null) === null) {
            continue;
        }
        $nom = trim($person['nom']);
        $prenom = trim(isset($person['prenom']) ? $person['prenom'] : '');
        $duplicate = import_exists(
            $bdd,
            "SELECT c.id_contrevenant
             FROM contrevenant c
             INNER JOIN appartiens_dossier ad ON ad.id_contrevenant = c.id_contrevenant
             WHERE ad.id_dossier = :id AND LOWER(c.nom) = LOWER(:nom)
               AND (c.prenom IS NULL OR LOWER(c.prenom) = LOWER(:prenom))
             LIMIT 1",
            array(':id' => $idDossier, ':nom' => $nom, ':prenom' => $prenom)
        );
        if ($duplicate) {
            $contrevenantIds[] = (int) $duplicate;
            $skipped[] = 'Contrevenant déjà présent : ' . $nom;
            continue;
        }

        $statutId = import_find_statut_id($bdd, isset($person['statut']) ? $person['statut'] : 'En cours');
        $isMoral = isset($person['type']) && $person['type'] === 'morale';
        if ($isMoral) {
            $stmt = $bdd->prepare(
                "INSERT INTO contrevenant (contrevenant, nom, representant_legal, adresse_siege, SIRET_SIREN)
                 VALUES (:libelle, :nom, :representant, :adresse, :siret)"
            );
            $stmt->execute(array(
                ':libelle' => import_display_name($person),
                ':nom' => $nom,
                ':representant' => import_null(isset($person['representant_legal']) ? $person['representant_legal'] : null),
                ':adresse' => import_null(isset($person['adresse_siege']) ? $person['adresse_siege'] : (isset($person['adresse']) ? $person['adresse'] : null)),
                ':siret' => import_null(isset($person['siret']) ? $person['siret'] : null),
            ));
        } else {
            $stmt = $bdd->prepare(
                "INSERT INTO contrevenant (contrevenant, civilite, nom, prenom, date_naissance, lieu_naissance, adresse)
                 VALUES (:libelle, :civilite, :nom, :prenom, :naissance, :lieu, :adresse)"
            );
            $stmt->execute(array(
                ':libelle' => import_display_name($person),
                ':civilite' => import_null(isset($person['civilite']) ? $person['civilite'] : 'M.'),
                ':nom' => $nom,
                ':prenom' => import_null($prenom),
                ':naissance' => import_date(isset($person['date_naissance']) ? $person['date_naissance'] : null),
                ':lieu' => import_null(isset($person['lieu_naissance']) ? $person['lieu_naissance'] : null),
                ':adresse' => import_null(isset($person['adresse']) ? $person['adresse'] : null),
            ));
        }
        $newId = (int) $bdd->lastInsertId();
        $bdd->prepare("INSERT INTO appartiens_dossier (id_contrevenant, id_dossier) VALUES (:c, :d)")
            ->execute(array(':c' => $newId, ':d' => $idDossier));
        $bdd->prepare(
            "INSERT INTO a_le_statut_con (id_contrevenant, id_dossier, id_statut_contrevenant)
             VALUES (:c, :d, :s)"
        )->execute(array(':c' => $newId, ':d' => $idDossier, ':s' => $statutId));
        $contrevenantIds[] = $newId;
        $created['contrevenants']++;
    }
    $contrevenantIds = array_values(array_unique($contrevenantIds));
    $mainContrevenantId = isset($contrevenantIds[0]) ? $contrevenantIds[0] : null;

    $infractions = isset($entities['infractions']) && is_array($entities['infractions']) ? $entities['infractions'] : array();
    foreach ($infractions as $infraction) {
        if (!is_array($infraction)) {
            continue;
        }
        $reference = import_null(isset($infraction['pv_reference']) ? $infraction['pv_reference'] : null);
        if ($reference) {
            $duplicate = import_exists(
                $bdd,
                "SELECT id_pv FROM signalement_pv WHERE id_dossier_1 = :id AND pv_reference = :ref LIMIT 1",
                array(':id' => $idDossier, ':ref' => $reference)
            );
            if ($duplicate) {
                $skipped[] = 'Infraction déjà présente : ' . $reference;
                continue;
            }
        }
        $stmt = $bdd->prepare(
            "INSERT INTO signalement_pv (
                pv_date, pv_reference, pv_correspondant, pv_contrevenant, pv_detruit, pv_enjeux,
                pv_obs, pv_type, pv_parcelle_prin, pv_parcelles_autres, pv_zonage, pv_cabanisation,
                pv_infra_obs, pv_commune, pv_arrondissement, id_dossier_1, id_dossier
            ) VALUES (
                :pv_date, :pv_reference, :pv_correspondant, :pv_contrevenant, :pv_detruit, :pv_enjeux,
                :pv_obs, :pv_type, :pv_parcelle_prin, :pv_parcelles_autres, :pv_zonage, :pv_cabanisation,
                :pv_infra_obs, :pv_commune, :pv_arrondissement, :id_dossier_1, :id_dossier
            )"
        );
        $stmt->execute(array(
            ':pv_date' => import_date(isset($infraction['pv_date']) ? $infraction['pv_date'] : null),
            ':pv_reference' => $reference,
            ':pv_correspondant' => import_null(isset($infraction['pv_correspondant']) ? $infraction['pv_correspondant'] : null),
            ':pv_contrevenant' => import_null(isset($infraction['pv_contrevenant']) ? $infraction['pv_contrevenant'] : null),
            ':pv_detruit' => import_yes(isset($infraction['pv_detruit']) ? $infraction['pv_detruit'] : '') ? '1' : '0',
            ':pv_enjeux' => import_null(isset($infraction['pv_enjeux']) ? $infraction['pv_enjeux'] : null),
            ':pv_obs' => import_null(isset($infraction['pv_obs']) ? $infraction['pv_obs'] : null),
            ':pv_type' => import_null(isset($infraction['pv_type']) ? $infraction['pv_type'] : 'Infraction urbanisme'),
            ':pv_parcelle_prin' => import_null(isset($infraction['pv_parcelle_prin']) ? $infraction['pv_parcelle_prin'] : (isset($fields['parcelle_principale']) ? $fields['parcelle_principale'] : null)),
            ':pv_parcelles_autres' => import_null(isset($infraction['pv_parcelles_autres']) ? $infraction['pv_parcelles_autres'] : null),
            ':pv_zonage' => import_null(isset($infraction['pv_zonage']) ? $infraction['pv_zonage'] : null),
            ':pv_cabanisation' => import_yes(isset($infraction['pv_cabanisation']) ? $infraction['pv_cabanisation'] : (isset($fields['cabanisation']) ? $fields['cabanisation'] : '')) ? '1' : '0',
            ':pv_infra_obs' => import_null(isset($infraction['pv_infra_obs']) ? $infraction['pv_infra_obs'] : null),
            ':pv_commune' => import_null(isset($infraction['pv_commune']) ? $infraction['pv_commune'] : (isset($fields['commune']) ? $fields['commune'] : null)),
            ':pv_arrondissement' => import_null(isset($infraction['pv_arrondissement']) ? $infraction['pv_arrondissement'] : null),
            ':id_dossier_1' => $idDossier,
            ':id_dossier' => $numDossier,
        ));
        $idPv = (int) $bdd->lastInsertId();
        $natinfIds = import_natinf_ids($bdd, isset($infraction['natinfs']) ? $infraction['natinfs'] : array());
        $linkNatinf = $bdd->prepare("INSERT INTO appartiens_natinf_infra (id_pv, id_natinf) VALUES (:pv, :natinf)");
        foreach ($natinfIds as $natinfId) {
            $linkNatinf->execute(array(':pv' => $idPv, ':natinf' => $natinfId));
        }
        $created['infractions']++;
    }

    $parquetIds = array();
    $parquets = isset($entities['parquets']) && is_array($entities['parquets']) ? $entities['parquets'] : array();
    foreach ($parquets as $parquet) {
        if (!is_array($parquet)) {
            continue;
        }
        $numero = import_null(isset($parquet['numero']) ? $parquet['numero'] : null);
        if ($numero) {
            $duplicate = import_exists(
                $bdd,
                "SELECT id_soit_transmis FROM soit_transmis WHERE id_dossier = :id AND soit_trans_numero = :numero LIMIT 1",
                array(':id' => $idDossier, ':numero' => $numero)
            );
            if ($duplicate) {
                $parquetIds[] = (int) $duplicate;
                $skipped[] = 'Soit-transmis déjà présent : ' . $numero;
                continue;
            }
        }
        $stmt = $bdd->prepare(
            "INSERT INTO soit_transmis (
                soit_trans_numero, soit_trans_damande_parquet, soit_trans_date_premiere_audition,
                soit_trans_date_limite_enquete, soit_trans_priorite, soit_trans_traite,
                soit_trans_observation, soit_trans_date, id_parquet, id_dossier
            ) VALUES (
                :numero, :demande, :audition, :limite, :priorite, :traite, :obs, :date_st, :parquet, :dossier
            )"
        );
        $stmt->execute(array(
            ':numero' => $numero,
            ':demande' => import_null(isset($parquet['demande']) ? $parquet['demande'] : null),
            ':audition' => import_date(isset($parquet['date_premiere_audition']) ? $parquet['date_premiere_audition'] : null),
            ':limite' => import_date(isset($parquet['date_limite_enquete']) ? $parquet['date_limite_enquete'] : null),
            ':priorite' => import_null(isset($parquet['priorite']) ? $parquet['priorite'] : (isset($fields['priorite']) ? $fields['priorite'] : null)),
            ':traite' => !empty($parquet['traite']) ? 1 : 0,
            ':obs' => import_null(isset($parquet['observation']) ? $parquet['observation'] : null),
            ':date_st' => import_date(isset($parquet['date']) ? $parquet['date'] : (isset($fields['date_du_soit_transmis']) ? $fields['date_du_soit_transmis'] : null)),
            ':parquet' => import_find_parquet_id($bdd, isset($parquet['parquet']) ? $parquet['parquet'] : 'Montpellier'),
            ':dossier' => $idDossier,
        ));
        $parquetIds[] = (int) $bdd->lastInsertId();
        $created['parquets']++;
    }
    $mainParquetId = isset($parquetIds[0]) ? $parquetIds[0] : null;

    $avisList = isset($entities['avis']) && is_array($entities['avis']) ? $entities['avis'] : array();
    foreach ($avisList as $avis) {
        if (!is_array($avis) || !$mainParquetId) {
            continue;
        }
        $stmt = $bdd->prepare(
            "INSERT INTO avis (avis_conclusion, avis_observations, avis_date) VALUES (:conclusion, :obs, :date_avis)"
        );
        $stmt->execute(array(
            ':conclusion' => import_null(isset($avis['conclusion']) ? $avis['conclusion'] : null),
            ':obs' => import_null(isset($avis['observation']) ? $avis['observation'] : null),
            ':date_avis' => import_date(isset($avis['date']) ? $avis['date'] : null),
        ));
        $avisId = (int) $bdd->lastInsertId();
        $bdd->prepare("INSERT INTO fais_objet (id_soit_transmis, id_avis) VALUES (:st, :avis)")
            ->execute(array(':st' => $mainParquetId, ':avis' => $avisId));
        $created['avis']++;
    }

    $audienceIds = array();
    $audiences = isset($entities['audiences']) && is_array($entities['audiences']) ? $entities['audiences'] : array();
    foreach ($audiences as $audience) {
        if (!is_array($audience)) {
            continue;
        }
        $stmt = $bdd->prepare(
            "INSERT INTO audience (
                audience_date, audience_juridiction, audience_type_proc, audience_objet,
                audience_observation, audience_suite, audience_date_renvoi
            ) VALUES (:d, :j, :t, :o, :obs, :suite, :renvoi)"
        );
        $stmt->execute(array(
            ':d' => import_date(isset($audience['date']) ? $audience['date'] : null),
            ':j' => import_null(isset($audience['juridiction']) ? $audience['juridiction'] : 'TJ Montpellier'),
            ':t' => import_null(isset($audience['type_procedure']) ? $audience['type_procedure'] : 'Correctionnel'),
            ':o' => import_null(isset($audience['objet']) ? $audience['objet'] : null),
            ':obs' => import_null(isset($audience['observation']) ? $audience['observation'] : null),
            ':suite' => import_null(isset($audience['suite']) ? $audience['suite'] : null),
            ':renvoi' => import_date(isset($audience['date_renvoi']) ? $audience['date_renvoi'] : null),
        ));
        $audienceId = (int) $bdd->lastInsertId();
        $bdd->prepare("INSERT INTO appartiens_aud (id_dossier, id_audience) VALUES (:d, :a)")
            ->execute(array(':d' => $idDossier, ':a' => $audienceId));
        $audienceIds[] = $audienceId;
        $created['audiences']++;
    }
    $mainAudienceId = isset($audienceIds[0]) ? $audienceIds[0] : null;

    $decisionIds = array();
    $decisions = isset($entities['decisions']) && is_array($entities['decisions']) ? $entities['decisions'] : array();
    foreach ($decisions as $decision) {
        if (!is_array($decision)) {
            continue;
        }
        $stmt = $bdd->prepare(
            "INSERT INTO decisions (
                decision_juridiction, decision_type, decision_procedure, decision_culpabilite,
                decision_peine, decision_amende, decision_peine_prison, decision_remise_etat,
                decision_qualification, decision_mode_signification, decision_date_signification,
                decision_date_notification, decision_date_decision, decision_decision_receptionnee,
                decision_observation, decision_delai, decision_montant_astreinte, decision_publication,
                decision_condamnation_solidaire, decision_sursis_amende, decision_sursis_prison, id_audience
            ) VALUES (
                :juridiction, :type, :procedure, :culpabilite, :peine, :amende, :prison, :remise,
                :qualification, :mode, :date_sign, :date_notif, :date_dec, :reception,
                :obs, :delai, :astreinte, :publication, :solidaire, :sursis_amende, :sursis_prison, :audience
            )"
        );
        $stmt->execute(array(
            ':juridiction' => import_null(isset($decision['juridiction']) ? $decision['juridiction'] : 'TJ Montpellier'),
            ':type' => import_null(isset($decision['type']) ? $decision['type'] : 'Jugement'),
            ':procedure' => 0,
            ':culpabilite' => import_null(isset($decision['culpabilite']) ? $decision['culpabilite'] : 'coupable'),
            ':peine' => import_yes(isset($decision['peine']) ? $decision['peine'] : 'true') ? 1 : 0,
            ':amende' => import_null(isset($decision['amende']) ? $decision['amende'] : null),
            ':prison' => import_null(isset($decision['peine_prison']) ? $decision['peine_prison'] : null),
            ':remise' => import_yes(isset($decision['remise_etat']) ? $decision['remise_etat'] : '') ? 1 : 0,
            ':qualification' => import_null(isset($decision['qualification']) ? $decision['qualification'] : null),
            ':mode' => import_null(isset($decision['mode_signification']) ? $decision['mode_signification'] : null),
            ':date_sign' => import_date(isset($decision['date_signification']) ? $decision['date_signification'] : null),
            ':date_notif' => import_date(isset($decision['date_notification']) ? $decision['date_notification'] : null),
            ':date_dec' => import_date(isset($decision['date']) ? $decision['date'] : null),
            ':reception' => 1,
            ':obs' => import_null(isset($decision['observation']) ? $decision['observation'] : null),
            ':delai' => import_null(isset($decision['delai']) ? $decision['delai'] : null),
            ':astreinte' => import_null(isset($decision['montant_astreinte']) ? $decision['montant_astreinte'] : null),
            ':publication' => 0,
            ':solidaire' => 0,
            ':sursis_amende' => null,
            ':sursis_prison' => null,
            ':audience' => $mainAudienceId,
        ));
        $decisionId = (int) $bdd->lastInsertId();
        if ($mainContrevenantId) {
            $bdd->prepare("INSERT INTO lien_contre_deci (id_contrevenant, id_decision) VALUES (:c, :d)")
                ->execute(array(':c' => $mainContrevenantId, ':d' => $decisionId));
        }
        $decisionIds[] = $decisionId;
        $created['decisions']++;
    }
    $mainDecisionId = isset($decisionIds[0]) ? $decisionIds[0] : null;

    $recoursList = isset($entities['recours']) && is_array($entities['recours']) ? $entities['recours'] : array();
    foreach ($recoursList as $recours) {
        if (!is_array($recours)) {
            continue;
        }
        $stmt = $bdd->prepare(
            "INSERT INTO recours (recours_date, recours_type, recours_observation, id_contrevenant, id_parquet)
             VALUES (:d, :t, :obs, :c, :p)"
        );
        $stmt->execute(array(
            ':d' => import_date(isset($recours['date']) ? $recours['date'] : null),
            ':t' => import_null(isset($recours['type']) ? $recours['type'] : 'Appel'),
            ':obs' => import_null(isset($recours['observation']) ? $recours['observation'] : null),
            ':c' => $mainContrevenantId,
            ':p' => null,
        ));
        $recoursId = (int) $bdd->lastInsertId();
        if ($mainDecisionId) {
            $bdd->prepare("INSERT INTO lien_recours_deci (id_recours, id_decision) VALUES (:r, :d)")
                ->execute(array(':r' => $recoursId, ':d' => $mainDecisionId));
        }
        $created['recours']++;
    }

    $courriers = isset($entities['courriers']) && is_array($entities['courriers']) ? $entities['courriers'] : array();
    foreach ($courriers as $courrier) {
        if (!is_array($courrier)) {
            continue;
        }
        $stmt = $bdd->prepare(
            "INSERT INTO courrier (courrier_date, courrier_objet, courrier_observation, id, id_contrevenant, id_dossier)
             VALUES (:d, :o, :obs, :agent, :c, :dossier)"
        );
        $stmt->execute(array(
            ':d' => import_date(isset($courrier['date']) ? $courrier['date'] : null),
            ':o' => import_null(isset($courrier['objet']) ? $courrier['objet'] : 'Courrier d\'information'),
            ':obs' => import_null(isset($courrier['observation']) ? $courrier['observation'] : null),
            ':agent' => import_find_agent_id($bdd, isset($courrier['emetteur']) ? $courrier['emetteur'] : ''),
            ':c' => $mainContrevenantId,
            ':dossier' => $idDossier,
        ));
        $created['courriers']++;
    }

    $rapports = isset($entities['rapports']) && is_array($entities['rapports']) ? $entities['rapports'] : array();
    foreach ($rapports as $rapport) {
        if (!is_array($rapport)) {
            continue;
        }
        $stmt = $bdd->prepare(
            "INSERT INTO rapport (rapport_date, rapport_emetteur, rapport_objet, rapport_observation, id_dossier)
             VALUES (:d, :e, :o, :obs, :dossier)"
        );
        $stmt->execute(array(
            ':d' => import_date(isset($rapport['date']) ? $rapport['date'] : null),
            ':e' => import_null(isset($rapport['emetteur']) ? $rapport['emetteur'] : 'Marie Dupont'),
            ':o' => import_null(isset($rapport['objet']) ? $rapport['objet'] : 'Rapport'),
            ':obs' => import_null(isset($rapport['observation']) ? $rapport['observation'] : null),
            ':dossier' => $idDossier,
        ));
        $created['rapports']++;
    }

    $requetes = isset($entities['requetes']) && is_array($entities['requetes']) ? $entities['requetes'] : array();
    foreach ($requetes as $requete) {
        if (!is_array($requete)) {
            continue;
        }
        $stmt = $bdd->prepare(
            "INSERT INTO requete (requete_date, requete_objet, requete_emetteur, requete_observation, id_dossier)
             VALUES (:d, :o, :e, :obs, :dossier)"
        );
        $stmt->execute(array(
            ':d' => import_date(isset($requete['date']) ? $requete['date'] : null),
            ':o' => import_null(isset($requete['objet']) ? $requete['objet'] : 'Requête'),
            ':e' => import_null(isset($requete['emetteur']) ? $requete['emetteur'] : 'Marie Dupont'),
            ':obs' => import_null(isset($requete['observation']) ? $requete['observation'] : null),
            ':dossier' => $idDossier,
        ));
        $created['requetes']++;
    }

    $recouvrements = isset($entities['recouvrements']) && is_array($entities['recouvrements']) ? $entities['recouvrements'] : array();
    foreach ($recouvrements as $recouvrement) {
        if (!is_array($recouvrement)) {
            continue;
        }
        $stmt = $bdd->prepare(
            "INSERT INTO recouvrement (
                recouvrement_date, recouvrement_objet, recouvrement_date_periode_debut,
                recouvrement_date_periode_fin, recouvrement_montant_journalier, recouvrement_montant_total,
                recouvrement_observation, id, id_contrevenant, id_dossier
            ) VALUES (
                :d, :o, :debut, :fin, :journalier, :total, :obs, :agent, :c, :dossier
            )"
        );
        $stmt->execute(array(
            ':d' => import_date(isset($recouvrement['date']) ? $recouvrement['date'] : null),
            ':o' => import_null(isset($recouvrement['objet']) ? $recouvrement['objet'] : 'Recouvrement d\'astreinte'),
            ':debut' => import_date(isset($recouvrement['date_debut']) ? $recouvrement['date_debut'] : null),
            ':fin' => import_date(isset($recouvrement['date_fin']) ? $recouvrement['date_fin'] : null),
            ':journalier' => import_null(isset($recouvrement['montant_journalier']) ? $recouvrement['montant_journalier'] : null),
            ':total' => import_null(isset($recouvrement['montant_total']) ? $recouvrement['montant_total'] : null),
            ':obs' => import_null(isset($recouvrement['observation']) ? $recouvrement['observation'] : null),
            ':agent' => import_find_agent_id($bdd, isset($recouvrement['emetteur']) ? $recouvrement['emetteur'] : ''),
            ':c' => $mainContrevenantId,
            ':dossier' => $idDossier,
        ));
        $created['recouvrements']++;
    }

    $procedures = isset($entities['procedures_liees']) && is_array($entities['procedures_liees']) ? $entities['procedures_liees'] : array();
    foreach ($procedures as $procedure) {
        if (!is_array($procedure)) {
            continue;
        }
        $ref = import_null(isset($procedure['ref']) ? $procedure['ref'] : null);
        if ($ref) {
            $duplicate = import_exists(
                $bdd,
                "SELECT id_conn FROM proc_connexes WHERE id_dossier = :id AND conn_ref = :ref LIMIT 1",
                array(':id' => $idDossier, ':ref' => $ref)
            );
            if ($duplicate) {
                $skipped[] = 'Procédure liée déjà présente : ' . $ref;
                continue;
            }
        }
        $stmt = $bdd->prepare(
            "INSERT INTO proc_connexes (conn_date, conn_ref, conn_auteur_1, conn_type, conn_auteur_2, conn_obs, id_dossier)
             VALUES (:d, :ref, :a1, :t, :a2, :obs, :dossier)"
        );
        $stmt->execute(array(
            ':d' => import_date(isset($procedure['date']) ? $procedure['date'] : null),
            ':ref' => $ref,
            ':a1' => import_null(isset($procedure['auteur1']) ? $procedure['auteur1'] : null),
            ':t' => import_null(isset($procedure['type']) ? $procedure['type'] : 'Procédure liée'),
            ':a2' => import_null(isset($procedure['auteur2']) ? $procedure['auteur2'] : null),
            ':obs' => import_null(isset($procedure['obs']) ? $procedure['obs'] : null),
            ':dossier' => $idDossier,
        ));
        $created['procedures_liees']++;
    }

    $bdd->commit();
    echo json_encode(array(
        'success' => true,
        'engine' => isset($decoded['engine']) ? $decoded['engine'] : 'ocr+rules',
        'fields' => $fields,
        'created' => $created,
        'skipped' => $skipped,
        'preview' => isset($decoded['preview']) ? $decoded['preview'] : '',
    ));
} catch (Exception $e) {
    if (isset($bdd) && $bdd instanceof PDO && $bdd->inTransaction()) {
        $bdd->rollBack();
    }
    echo json_encode(array(
        'success' => false,
        'error' => 'Impossible de créer les éléments du dossier.',
        'detail' => $e->getMessage(),
    ));
}
