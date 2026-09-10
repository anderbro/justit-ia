<?php
/**
 * Crée ou met à jour le compte administrateur avec un mot de passe hashé.
 * Usage : docker compose exec php php docker/seed-admin.php [mot_de_passe]
 */
require_once __DIR__ . '/../bd.php';

$plainPassword = $argv[1] ?? 'admin123';
$email = 'admin@ddtm34.fr';

$bdd = getBD();
$hash = password_hash($plainPassword, PASSWORD_DEFAULT);

$stmt = $bdd->prepare('SELECT id_user FROM user WHERE mail = :mail');
$stmt->execute([':mail' => $email]);
$existing = $stmt->fetch(PDO::FETCH_ASSOC);

if ($existing) {
    $update = $bdd->prepare('UPDATE user SET password = :password WHERE id_user = :id_user');
    $update->execute([
        ':password' => $hash,
        ':id_user' => $existing['id_user'],
    ]);
    $userId = (int) $existing['id_user'];
    echo "Mot de passe admin mis à jour pour {$email}\n";
} else {
    $insert = $bdd->prepare('INSERT INTO user (mail, password, prenom, nom) VALUES (:mail, :password, :prenom, :nom)');
    $insert->execute([
        ':mail' => $email,
        ':password' => $hash,
        ':prenom' => 'Admin',
        ':nom' => 'DDTM34',
    ]);
    $userId = (int) $bdd->lastInsertId();
    echo "Compte admin créé pour {$email}\n";
}

$roleCheck = $bdd->prepare('SELECT 1 FROM a_le_role WHERE id_user = :id_user AND id_role = 1');
$roleCheck->execute([':id_user' => $userId]);
if (!$roleCheck->fetchColumn()) {
    $assign = $bdd->prepare('INSERT INTO a_le_role (id_user, id_role) VALUES (:id_user, 1)');
    $assign->execute([':id_user' => $userId]);
}

echo "Identifiants : {$email} / {$plainPassword}\n";
