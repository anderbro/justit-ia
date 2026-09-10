document.addEventListener("DOMContentLoaded", function () {
  fetch("script/script_profil.php", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const profilContainer = document.getElementById("profilContainer");

      if (data.profil) {
        const form = document.createElement("form");
        form.classList.add("needs-validation");
        form.setAttribute("novalidate", "");

        const champBase = document.createElement("div");
        champBase.classList.add("champbase");

        for (const key in data.profil) {
          if (key !== "password") {
            const formGroup = document.createElement("div");
            formGroup.classList.add("champcont1");

            const label = document.createElement("label");
            label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            label.setAttribute("for", key);

            const input = document.createElement("input");
            input.classList.add("form-control");
            input.setAttribute("type", "text");
            input.setAttribute("id", key);
            input.setAttribute("name", key);
            input.setAttribute("value", data.profil[key]);

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            champBase.appendChild(formGroup);
          }
        }

        form.appendChild(champBase);

        // Gestion du mot de passe
        const remdpDiv = document.createElement("div");
        remdpDiv.classList.add("remdp");

        // Ancien mot de passe
        const oldPasswordDiv = document.createElement("div");
        oldPasswordDiv.classList.add("champcont2");
        const oldPasswordLabel = document.createElement("label");
        oldPasswordLabel.textContent = "Ancien mot de passe";
        oldPasswordLabel.setAttribute("for", "oldPassword");
        const oldPasswordInput = document.createElement("input");
        oldPasswordInput.classList.add("form-control");
        oldPasswordInput.setAttribute("type", "password");
        oldPasswordInput.setAttribute("id", "oldPassword");
        oldPasswordInput.setAttribute("name", "oldPassword");
        oldPasswordDiv.appendChild(oldPasswordLabel);
        oldPasswordDiv.appendChild(oldPasswordInput);

        // Nouveau mot de passe
        const newPasswordDiv = document.createElement("div");
        newPasswordDiv.classList.add("champcont2");
        const newPasswordLabel = document.createElement("label");
        newPasswordLabel.textContent = "Nouveau mot de passe";
        newPasswordLabel.setAttribute("for", "newPassword");
        const newPasswordInput = document.createElement("input");
        newPasswordInput.classList.add("form-control");
        newPasswordInput.setAttribute("type", "password");
        newPasswordInput.setAttribute("id", "newPassword");
        newPasswordInput.setAttribute("name", "newPassword");
        newPasswordDiv.appendChild(newPasswordLabel);
        newPasswordDiv.appendChild(newPasswordInput);

        // Confirmation du nouveau mot de passe
        const confirmNewPasswordDiv = document.createElement("div");
        confirmNewPasswordDiv.classList.add("champcont2");
        const confirmNewPasswordLabel = document.createElement("label");
        confirmNewPasswordLabel.textContent = "Confirmation";
        confirmNewPasswordLabel.setAttribute("for", "confirmNewPassword");
        const confirmNewPasswordInput = document.createElement("input");
        confirmNewPasswordInput.classList.add("form-control");
        confirmNewPasswordInput.setAttribute("type", "password");
        confirmNewPasswordInput.setAttribute("id", "confirmNewPassword");
        confirmNewPasswordInput.setAttribute("name", "confirmNewPassword");
        confirmNewPasswordDiv.appendChild(confirmNewPasswordLabel);
        confirmNewPasswordDiv.appendChild(confirmNewPasswordInput);

        // Ajout des champs de mot de passe au formulaire
        remdpDiv.appendChild(oldPasswordDiv);
        remdpDiv.appendChild(newPasswordDiv);
        remdpDiv.appendChild(confirmNewPasswordDiv);
        form.appendChild(remdpDiv);

        // Bouton de modification
        const modifierButton = document.createElement("button");
        modifierButton.classList.add("modifprofbtn");
        modifierButton.textContent = "Modifier";
        modifierButton.addEventListener("click", function (event) {
          event.preventDefault();

          // Traitement des données du formulaire
          const formData = new FormData(form);
          fetch("script/script_profil.php", {
            method: "POST",
            body: formData,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Erreur HTTP, statut : " + response.status);
              }
              return response.json();
            })
            .then((result) => {
              // Gestion de la réponse
              if (result.success) {
                Swal.fire({
                  icon: "success",
                  title: "Modification réussie",
                  text: "Les informations du profil ont été mises à jour.",
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Erreur de modification",
                  text: "Une erreur s'est produite lors de la mise à jour du profil.",
                });
              }
            })
            .catch((error) => {
              console.error("Erreur lors de la requête AJAX : ", error);
              Swal.fire({
                icon: "error",
                title: "Erreur AJAX",
                text: "Une erreur s'est produite lors de la mise à jour du profil. Consultez la console pour plus de détails.",
              });
            });
        });

        form.appendChild(modifierButton);
        profilContainer.appendChild(form);
      } else {
        Swal.fire({
          icon: "info",
          title: "Aucun profil trouvé",
          text: "Aucun profil correspondant à l'utilisateur connecté.",
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la récupération du profil.",
      });
    });
});
