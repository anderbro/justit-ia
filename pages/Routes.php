<?php
// Récupérer l'URL de la requête
$requestUri = $_SERVER['REQUEST_URI'];

// Créer un tableau associatif pour mapper les URL aux contrôleurs/actions
$routes = [
    '/' => 'Accueil@index',
    // Route de la page d'accueil


];

// Votre logique de routage
if (isset($routes[$requestUri])) {
    list($controllerName, $action) = explode('@', $routes[$requestUri]);
    $controllerClassName = $controllerName . 'Controller';

    // Chargez et exécutez le contrôleur et l'action appropriés
    if (class_exists($controllerClassName)) {
        $controller = new $controllerClassName();
        if (method_exists($controller, $action)) {
            $controller->$action();
        } else {
            echo "Action non trouvée.";
        }
    } else {
        echo "Contrôleur non trouvé.";
    }
} else {
    echo "Page non trouvée.";
}
?>