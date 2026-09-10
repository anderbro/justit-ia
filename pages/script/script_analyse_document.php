<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['utilisateur'])) {
    echo json_encode(array('success' => false, 'error' => 'Non authentifié.'));
    exit();
}

if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(array('success' => false, 'error' => 'Veuillez déposer un PDF ou une image lisible.'));
    exit();
}

$file = $_FILES['document'];
$allowed = array(
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/webp',
);
$mime = $file['type'];
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

$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExt = array('pdf', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'webp');
if (!in_array($extension, $allowedExt, true) && !in_array($mime, $allowed, true)) {
    echo json_encode(array('success' => false, 'error' => 'Format non pris en charge. Utilisez un PDF ou une image.'));
    exit();
}

$aiUrl = getenv('AI_URL') ?: 'http://ai:8000';
$communes = isset($_POST['communes']) ? $_POST['communes'] : '[]';

$curlFile = new CURLFile($file['tmp_name'], $mime ?: 'application/octet-stream', $file['name']);
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
if (!is_array($decoded)) {
    echo json_encode(array('success' => false, 'error' => 'Réponse IA illisible.', 'status' => $status));
    exit();
}

if ($status >= 400) {
    $message = isset($decoded['detail']) ? $decoded['detail'] : 'Analyse impossible.';
    echo json_encode(array('success' => false, 'error' => $message));
    exit();
}

echo json_encode($decoded);
