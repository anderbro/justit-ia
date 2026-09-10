// Dans votre fichier inscription.js
document.addEventListener("DOMContentLoaded", function () {
  const inscriptionFormContainer = document.getElementById(
    "inscriptionFormContainer"
  );

  // Formulaire d'inscription en dur avec Bootstrap
  const formHtml = `
      <form id="inscriptionForm">
          <div class="champ">
              <label for="nom" class="form-label">Nom</label>
              <input type="text" class="form-control" id="nom" name="nom" placeholder="Votre nom" required autocomplete="family-name">
          </div>
          <div class="champ">
              <label for="prenom" class="form-label">Prénom</label>
              <input type="text" class="form-control" id="prenom" name="prenom" placeholder="Votre prénom" required autocomplete="given-name">
          </div>
          <div class="champ">
              <label for="mail" class="form-label">Adresse e-mail</label>
              <input type="email" class="form-control" id="mail" name="mail" placeholder="nom@exemple.fr" required autocomplete="email">
          </div>
          <div class="champ">
              <label for="password" class="form-label">Mot de passe</label>
              <input type="password" class="form-control" id="password" name="password" placeholder="••••••••" required autocomplete="new-password">
          </div>
          <div class="champ">
              <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
              <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="••••••••" required autocomplete="new-password">
          </div>
          <button type="submit" class="connexionbutton">Créer un compte</button>
      </form>
  `;

  // Injecter le formulaire dans le conteneur
  inscriptionFormContainer.innerHTML = formHtml;

  // Écouter l'événement de soumission du formulaire d'inscription
  document
    .getElementById("inscriptionForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // Récupérer les données du formulaire
      const formData = new FormData(document.getElementById("inscriptionForm"));

      // Effectuer la requête Ajax vers le script_inscription.php
      fetch("../script/script_inscription.php", {
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
            // Inscription réussie, rediriger ou effectuer d'autres actions nécessaires
            window.location.href = "../../index.php";
          } else {
            // Afficher une alerte en cas d'erreur
            Swal.fire({
              icon: "error",
              title: "Erreur d'inscription",
              text:
                response.message ||
                "Une erreur s'est produite lors de l'inscription.",
            });
          }
        })
        .catch((error) => {
          // Afficher une alerte en cas d'erreur
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Une erreur s'est produite lors de l'inscription.",
          });
        });
    });

  // Ajouter le bouton de retour
  const retourButton = document.getElementById("retour");

  if (retourButton) {
    retourButton.addEventListener("click", function () {
      // Redirection vers la page des paramètres
      window.location.href = "../administration.php";
    });
  }
});
