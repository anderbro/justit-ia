document.addEventListener("DOMContentLoaded", function () {
  const modifierProfilContainer = document.getElementById(
    "modifierProfilContainer"
  );

  const form = document.createElement("form");
  form.classList.add("needs-validation");
  form.setAttribute("novalidate", "");

  // Ajoutez ici les champs du formulaire pour la modification du profil, y compris le champ pour le mot de passe actuel

  const modifierButton = document.createElement("button");
  modifierButton.classList.add("btn", "btn-primary", "mt-3");
  modifierButton.textContent = "Modifier";
  modifierButton.addEventListener("click", function () {
    // Ajoutez ici le code pour soumettre le formulaire vers le backend pour la modification
    alert("Formulaire soumis pour la modification !");
  });

  form.appendChild(modifierButton);
  modifierProfilContainer.appendChild(form);
});
