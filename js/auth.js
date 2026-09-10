// auth.js
document.addEventListener("DOMContentLoaded", function () {
  const authFormContainer = document.getElementById("connexionFormContainer");
  const toggleAuthButtonConnexion = document.getElementById(
    "toggleAuthButtonConnexion"
  );
  const toggleAuthButtonInscription = document.getElementById(
    "toggleAuthButtonInscription"
  );

  // Charger la page de connexion par défaut
  loadAuthPage("connexion");

  // Écouter l'événement des boutons de bascule
  toggleAuthButtonConnexion.addEventListener("click", function () {
    console.log("Toggle button Connexion clicked");
    toggleAuthPage("connexion");
  });

  toggleAuthButtonInscription.addEventListener("click", function () {
    console.log("Toggle button Inscription clicked");
    toggleAuthPage("inscription");
  });

  // Fonction pour charger dynamiquement la page de connexion ou d'inscription
  function loadAuthPage(page) {
    fetch(`../connexion/${page}.php`)
      .then((response) => response.text())
      .then((html) => {
        authFormContainer.innerHTML = html;
      })
      .catch((error) => {
        console.error("Erreur lors du chargement de la page :", error);
      });
  }

  // Fonction pour basculer entre les pages
  function toggleAuthPage(page) {
    console.log(`Toggling to ${page}`);
    loadAuthPage(page);
  }
});
