<?php
session_start();
include("../../bd.php");

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['utilisateur'])) {
    echo json_encode(array('success' => false, 'error' => 'Non authentifié.'));
    exit();
}

$id = isset($_POST['id']) ? $_POST['id'] : null;
$type = isset($_POST['type']) ? $_POST['type'] : null;
$rawData = isset($_POST['data']) ? json_decode($_POST['data'], true) : null;

if ($id === null || $type !== 'dossier' || !is_array($rawData)) {
    echo json_encode(array('success' => false, 'error' => 'Données manquantes.'));
    exit();
}

$payload = $rawData;
if (isset($rawData['data']['details'][0]) && is_array($rawData['data']['details'][0])) {
    $payload = $rawData['data']['details'][0];
}

$allowed = array(
    'parcelle_princ',
    'cabanisation',
    'dossier_sensible',
    'commune',
    'obs_dossier',
    'prescription',
    'date_prescription',
    'archivage',
    'date_archivage',
);

$fields = array();
$params = array(':id' => $id);

foreach ($allowed as $column) {
    if (!array_key_exists($column, $payload)) {
        continue;
    }
    $value = $payload[$column];
    if ($value === '' || $value === false) {
        $value = null;
    }
    if (in_array($column, array('dossier_sensible', 'prescription', 'archivage'), true)) {
        $value = ($payload[$column] === true || $payload[$column] === 1 || $payload[$column] === '1') ? 1 : 0;
    }
    $fields[] = "$column = :$column";
    $params[":$column"] = $value;
}

if (count($fields) === 0) {
    echo json_encode(array('success' => false, 'error' => 'Aucun champ à mettre à jour.'));
    exit();
}

try {
    $bdd = getBD();
    $sql = "UPDATE dossier SET " . implode(', ', $fields) . " WHERE id_dossier = :id";
    $stmt = $bdd->prepare($sql);
    $stmt->execute($params);
    echo json_encode(array('success' => true));
} catch (PDOException $e) {
    echo json_encode(array('success' => false, 'error' => 'Erreur lors de la mise à jour des détails.'));
}
