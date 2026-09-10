// connexion.js
document.addEventListener("DOMContentLoaded", function () {
  const connexionFormContainer = document.getElementById(
    "connexionFormContainer"
  );

  // Formulaire de connexion en dur avec Bootstrap
  const formHtml = `
        <form id="connexionForm">
            <div class="mail">
                <label for="mail" class="form-label">Adresse e-mail</label>
                <input type="email" class="form-control" id="mail" name="mail" placeholder="nom@exemple.fr" required autocomplete="email">
            </div>
            <div class="mdp">
                <label for="password" class="form-label">Mot de passe</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="••••••••" required autocomplete="current-password">
            </div>
            <button type="submit" class="connexionbutton">Se connecter</button>
        </form>
    `;

  // Injecter le formulaire dans le conteneur
  connexionFormContainer.innerHTML = formHtml;

  // Écouter l'événement de soumission du formulaire de connexion
  document
    .getElementById("connexionForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // Récupérer les données du formulaire
      const formData = new FormData(document.getElementById("connexionForm"));

      // Effectuer la requête Ajax vers le script_connexion.php
      fetch("../script/script_connexion.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur HTTP, statut : " + response.status);
          }
          return response.json();
        })
        .then((response) => {
          if (response.success) {
            // Connexion réussie, rediriger ou effectuer d'autres actions nécessaires
            window.location.href = "../../index.php";
          } else {
            // Afficher une alerte en cas d'erreur
            Swal.fire({
              icon: "error",
              title: "Erreur de connexion",
              text:
                response.message ||
                "Une erreur s'est produite lors de la connexion.",
            });
          }
        })
        .catch((error) => {
          // Afficher une alerte en cas d'erreur
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Une erreur s'est produite lors de la connexion.",
          });
        });
    });

  // Écouter l'événement de clic sur le bouton de bascule
  const toggleAuthButtonInscription = document.getElementById(
    "toggleAuthButtonInscription"
  );

  if (toggleAuthButtonInscription) {
    toggleAuthButtonInscription.addEventListener("click", function () {
      console.log("Bouton de bascule vers Inscription cliqué !");
      // Redirection vers la page d'inscription avec un chemin relatif
      window.location.href = "inscription.php";
    });
  }
});
