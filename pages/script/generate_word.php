<?php
require 'vendor/autoload.php';

use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;

// Récupérer les données du formulaire
$pv_date = $_POST['pv_date'] ?? '';
$pv_commune = $_POST['pv_commune'] ?? '';
$pv_reference = $_POST['pv_reference'] ?? '';
$pv_correspondant = $_POST['pv_correspondant'] ?? '';
$pv_contrevenant = $_POST['pv_contrevenant'] ?? '';
$pv_enjeux = $_POST['pv_enjeux'] ?? '';
$pv_obs = $_POST['pv_obs'] ?? '';
$pv_type = $_POST['pv_type'] ?? '';
$pv_arrondissement = $_POST['pv_arrondissement'] ?? '';
$pv_zonage = $_POST['pv_zonage'] ?? '';

$pv_natinf = $_POST['pv_natinf'] ?? [];

// Créer un nouveau document Word
$phpWord = new PhpWord();
$section = $phpWord->addSection();
$section->addText("Date: $pv_date");
$section->addText("Commune: $pv_commune");
$section->addText("Référence: $pv_reference");
$section->addText("Correspondant: $pv_correspondant");
$section->addText("Contrevenant: $pv_contrevenant");
$section->addText("Enjeux: $pv_enjeux");
$section->addText("Observations: $pv_obs");
$section->addText("Type: $pv_type");
$section->addText("Arrondissement: $pv_arrondissement");
$section->addText("Zonage: $pv_zonage");

$section->addText("Natinf:");
foreach ($pv_natinf as $natinf) {
    $section->addText($natinf);
}

// Sauvegarder le document en mémoire
$temp_file = tempnam(sys_get_temp_dir(), 'PHPWord');
$phpWord->save($temp_file, 'Word2007');

// Envoyer le document en réponse
header('Content-Description: File Transfer');
header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
header('Content-Disposition: attachment; filename="infraction.docx"');
header('Cache-Control: must-revalidate');
header('Content-Length: ' . filesize($temp_file));
readfile($temp_file);
unlink($temp_file);
exit;
?>
