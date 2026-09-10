<?php
session_start();

// Détruisez la session
session_destroy();

// Réponse JSON indiquant le succès
header('Content-Type: application/json');
echo json_encode(array('success' => true));
?>