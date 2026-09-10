document.addEventListener("DOMContentLoaded", function () {
  // Effectuer une requête AJAX pour obtenir la liste des utilisateurs
  fetch("../pages/script/utilisateur/script_liste_utilisateurs.php", {
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
      const userListContainer = document.getElementById("userListContainer");

      if (data.users && data.users.length > 0) {
        // Créer le tableau Bootstrap
        const table = document.createElement("table");
        table.classList.add(
          "table",
          "table-striped",
          "table-bordered",
          "tableau-profils"
        );

        // Créer l'en-tête du tableau
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const headers = ["Nom", "Prénom", "Mail", "Rôle", "Actions"]; // Ajouter une colonne pour les actions
        headers.forEach((headerText) => {
          const th = document.createElement("th");
          th.textContent = headerText;
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Créer le corps du tableau
        const tbody = document.createElement("tbody");
        data.users.forEach((user) => {
          const row = document.createElement("tr");
          row.dataset.userId = user.id_user; // Ajouter l'ID de l'utilisateur ici

          // Ajouter les colonnes d'informations de l'utilisateur
          const userInfoColumns = ["nom", "prenom", "mail", "role"];
          userInfoColumns.forEach((columnName) => {
            const cell = document.createElement("td");
            cell.textContent = user[columnName];
            row.appendChild(cell);
          });

          // Ajouter la colonne d'actions avec les boutons Bootstrap
          const actionCell = document.createElement("td");
          actionCell.classList.add("case-boutons");
          const editButton = document.createElement("button");
          editButton.classList.add("btn", "color");
          editButton.innerHTML = '<img src="../img/edit.svg" alt="">';

          const deleteButton = document.createElement("button");
          deleteButton.classList.add("btn", "btn-danger");
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';

          actionCell.appendChild(editButton);
          actionCell.appendChild(deleteButton);
          row.appendChild(actionCell);

          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        userListContainer.appendChild(table);

        // Utiliser un seul écouteur d'événements sur tbody pour les deux actions
        tbody.addEventListener("click", (event) => {
          const target = event.target;
          const userId = target.closest("tr").dataset.userId;

          if (target.tagName === "IMG") {
            const imgSrc = target.getAttribute("src");
            if (imgSrc.includes("edit.svg")) {
              showEditUserPopup(userId);
            } else if (imgSrc.includes("delete.svg")) {
              deleteUser(userId);
            }
          }
        });
      } else {
        userListContainer.textContent = "Aucun utilisateur trouvé.";
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la récupération de la liste des utilisateurs.",
      });
    });
});

function showEditUserPopup(userId) {
  // Effectuer une requête AJAX pour obtenir les détails de l'utilisateur spécifique
  fetch(
    `../pages/script/utilisateur/script_details_utilisateur.php?id=${userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      // Afficher une popup avec les détails de l'utilisateur et un formulaire pour la modification
      if (data.user) {
        console.log("UserID: ", data.user, userId);
        showEditUserForm(data.user, userId);
      } else {
        Swal.fire({
          icon: "info",
          title: "Aucun utilisateur trouvé",
          text: "Aucun utilisateur correspondant à l'ID spécifié.",
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la récupération des détails de l'utilisateur. Consultez la console pour plus de détails.",
      });
    });
}

function showEditUserForm(userDetails, userId) {
  console.log("UserID: ", userDetails);
  // Générer un formulaire avec les détails de l'utilisateur
  const form = document.createElement("form");
  form.classList.add("editUserForm");

  // Ajouter les autres champs du formulaire
  for (const key in userDetails) {
    if (key !== "role") {
      const formGroup = document.createElement("div");
      formGroup.classList.add("mb-3");

      const label = document.createElement("label");
      label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      label.setAttribute("for", key);

      const input = document.createElement("input");
      input.classList.add("form-control");
      input.setAttribute("type", "text");
      input.setAttribute("id", key);
      input.setAttribute("name", key);
      input.setAttribute("value", userDetails[key]);

      formGroup.appendChild(label);
      formGroup.appendChild(input);
      form.appendChild(formGroup);
    }
  }

  // Effectuer une requête AJAX pour obtenir la liste des rôles
  fetch("../pages/script/utilisateur/script_liste_roles.php", {
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
      const roles = data.roles || [];
      // Ajouter un titre "Rôle" avant la liste déroulante
      const roleLabel = document.createElement("label");
      roleLabel.textContent = "Rôle";
      form.appendChild(roleLabel);

      // Ajouter une liste déroulante pour le rôle
      const roleSelect = document.createElement("select");
      roleSelect.classList.add("form-control", "mb-3");
      roleSelect.setAttribute("id", "role");
      roleSelect.setAttribute("name", "role");

      // Remplir la liste déroulante avec les rôles récupérés
      roles.forEach((role) => {
        const option = document.createElement("option");
        option.value = role.id_role;
        option.text = role.nom_role;
        roleSelect.appendChild(option);
      });

      // Sélectionner le rôle actuel de l'utilisateur
      roleSelect.value = userDetails.role;

      form.appendChild(roleSelect);

      // Ajouter des champs pour le nouveau mot de passe
      const newPasswordInput = document.createElement("input");
      newPasswordInput.classList.add("form-control", "mb-3");
      newPasswordInput.setAttribute("type", "password");
      newPasswordInput.setAttribute("id", "newPassword");
      newPasswordInput.setAttribute("name", "newPassword");
      newPasswordInput.setAttribute("placeholder", "Nouveau mot de passe");
      form.appendChild(newPasswordInput);

      const confirmNewPasswordInput = document.createElement("input");
      confirmNewPasswordInput.classList.add("form-control", "mb-3");
      confirmNewPasswordInput.setAttribute("type", "password");
      confirmNewPasswordInput.setAttribute("id", "confirmNewPassword");
      confirmNewPasswordInput.setAttribute("name", "confirmNewPassword");
      confirmNewPasswordInput.setAttribute(
        "placeholder",
        "Confirmer le nouveau mot de passe"
      );
      form.appendChild(confirmNewPasswordInput);

      // Ajouter un bouton "Enregistrer"
      const saveButton = document.createElement("button");
      saveButton.classList.add("btn", "btn-primary", "mb-3");
      saveButton.textContent = "Enregistrer";
      saveButton.style.backgroundColor = "#030f8e";
      saveButton.style.borderColor = "#030f8e";
      saveButton.addEventListener("click", function (event) {
        event.preventDefault(); // Empêche le comportement par défaut du bouton submit

        // Retirez l'attribut readonly avant d'envoyer la requête
        const inputs = form.getElementsByTagName("input");
        for (let i = 0; i < inputs.length; i++) {
          inputs[i].removeAttribute("readonly");
        }

        const formData = new FormData(form);

        // Ajouter le nom du rôle à la requête
        // const roleSelect = form.querySelector("#role");
        // const selectedRole = roleSelect.options[roleSelect.selectedIndex].text;

        // formData.append("role", selectedRole);

        // Ajouter le nom du rôle à la requête
        const roleSelect = form.querySelector("#role");
        const selectedRoleValue = roleSelect.value; // Utilisez la valeur de l'option sélectionnée
        formData.append("role", selectedRoleValue);

        // Ajoutez l'userId à la requête
        formData.append("id_user", userId);

        // Effectuer une requête AJAX pour mettre à jour les détails de l'utilisateur
        fetch("../pages/script/utilisateur/script_modifier_utilisateur.php", {
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
            // Gérez la réponse du serveur après la modification
            if (result.success) {
              Swal.fire({
                icon: "success",
                title: "Modification réussie",
                text: "Les informations de l'utilisateur ont été mises à jour.",
              }).then(() => {
                // Actualiser la liste des utilisateurs après la modification
                location.reload();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Erreur de modification",
                text: "Une erreur s'est produite lors de la mise à jour des informations de l'utilisateur.",
              });
            }
          })
          .catch((error) => {
            console.error("Erreur lors de la requête AJAX : ", error);
            console.log("Détails de l'erreur : ", error.details); // Afficher le détail de l'erreur
            Swal.fire({
              icon: "error",
              title: "Erreur AJAX",
              text: "Une erreur s'est produite lors de la mise à jour des informations de l'utilisateur. Consultez la console pour plus de détails.",
            });
          });
      });
      form.appendChild(saveButton);
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la récupération de la liste des rôles. Consultez la console pour plus de détails.",
      });
    });

  // Afficher une popup avec le formulaire
  Swal.fire({
    html: form,
    showCancelButton: true,
    cancelButtonText: "Annuler",
    showConfirmButton: false,
  });
}

function deleteUser(userId) {
  // Afficher une popup de confirmation
  Swal.fire({
    title: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Oui, supprimer",
    cancelButtonText: "Annuler",
  }).then((result) => {
    if (result.isConfirmed) {
      // L'utilisateur a confirmé la suppression
      const formData = new FormData();
      formData.append("userId", userId);

      fetch(`../pages/script/utilisateur/script_supprimer_utilisateur.php`, {
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
          // Gérez la réponse du serveur après la suppression
          if (result.success) {
            Swal.fire({
              icon: "success",
              title: "Suppression réussie",
              text: "L'utilisateur a été supprimé avec succès.",
            }).then(() => {
              // Actualiser la liste des utilisateurs après la suppression
              location.reload();
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Erreur de suppression",
              text: "Une erreur s'est produite lors de la suppression de l'utilisateur.",
            });
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la requête AJAX : ", error);
          Swal.fire({
            icon: "error",
            title: "Erreur AJAX",
            text: "Une erreur s'est produite lors de la suppression de l'utilisateur. Consultez la console pour plus de détails.",
          });
        });
    }
  });
}
