<?php

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['utilisateur'])) {
    $base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
    if (str_ends_with($base, '/pages')) {
        $loginUrl = dirname($base) . '/pages/connexion/connexion.php';
    } else {
        $loginUrl = $base . '/pages/connexion/connexion.php';
    }
    header('Location: ' . $loginUrl);
    exit();
}
