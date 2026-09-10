document.addEventListener("DOMContentLoaded", function () {
  const toggleAuthButtonInscription = document.getElementById(
    "toggleAuthButtonInscription"
  );
  const gestionDroits = document.getElementById("gestionDroits");
  const gestionAgents = document.getElementById("gestionAgents");

  if (toggleAuthButtonInscription) {
    toggleAuthButtonInscription.addEventListener("click", function () {
      // Redirection vers la page d'inscription
      window.location.href = "../pages/connexion/inscription.php";
    });
  }

  if (gestionDroits) {
    gestionDroits.addEventListener("click", function () {
      // Redirection vers la page d'inscription
      window.location.href = "../pages/gestion_profils.php";
    });
  }

  if (gestionAgents) {
    gestionAgents.addEventListener("click", function () {
      // Redirection vers la page d'inscription
      window.location.href = "../pages/gestion_agents.php";
    });
  }
});
