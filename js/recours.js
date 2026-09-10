document.addEventListener("DOMContentLoaded", function () {
  const btnAjouterRecours = document.getElementById("btnAjouterRecours");

  btnAjouterRecours.addEventListener("click", function () {
    showPopupFormRecours();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");
  const type = urlParams.get("type");

  fetch(`../pages/script/recours/script_details_recours.php?id=${dossierId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    // body: "id=" + dossierId + "&type=" + type,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Données recours reçues :", data);

      const tableBody = document.getElementById("tableBodyRecours");

      if (data && Array.isArray(data.recours) && data.recours.length > 0) {
        data.recours.forEach((recours) => {
          const row = document.createElement("tr");

          // Colonne Date
          const cellDate = document.createElement("td");
          cellDate.textContent = recours.recours_date; // Utilisation correcte du nom de propriété
          row.appendChild(cellDate);

          // Colonne Auteur
          const cellAuteur = document.createElement("td");
          cellAuteur.textContent = recours.contrevenant_nom; // Exemple : nom du contrevenant
          row.appendChild(cellAuteur);

          // Colonne Type
          const cellType = document.createElement("td");
          cellType.textContent = recours.recours_type;
          row.appendChild(cellType);

          // Colonne Observations
          const cellObservations = document.createElement("td");
          cellObservations.textContent = recours.recours_observation;
          row.appendChild(cellObservations);

          // Colonne Actions
          const actionCell = document.createElement("td");

          // Bouton "Modifier"
          const modifyButton = document.createElement("button");
          modifyButton.classList.add("bouton-modification-recours");
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            // Appeler une fonction pour afficher la pop-up de modification de recours
            showRecoursPopup(recours);
          });

          actionCell.appendChild(modifyButton);
          actionCell.classList.add("bouton-tab-cont-recours");

          // Bouton "Supprimer"
          const deleteButton = document.createElement("button");
          deleteButton.classList.add("bouton-suppression-recours");
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            // Ajouter une confirmation avant la suppression
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer ce recours?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                // Appeler une fonction pour gérer la suppression
                deleteRecours(recours.id_recours);
              }
            });
          });
          actionCell.appendChild(deleteButton);

          row.appendChild(actionCell);
          tableBody.appendChild(row);
        });
      } else {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.setAttribute("colspan", "5");
        cell.textContent = "Aucun recours trouvé";
        row.appendChild(cell);
        tableBody.appendChild(row);
      }
    })

    .catch((error) => {
      console.error("Erreur lors de la requête AJAX :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la récupération des recours.",
      });
    });
});

function showPopupFormRecours() {
  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");

  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "recours-form");

  const titreRecours = document.createElement("h1");
  titreRecours.innerText = "Recours";
  titreRecours.id = "titre_recours";

  const decisionLabel = document.createElement("label");
  decisionLabel.innerText = "Décision :";
  const decisionInput = document.createElement("select");
  decisionInput.name = "decision_recours";

  fetch(`../pages/script/decision/script_decision.php?id=${dossierId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      if (data && Array.isArray(data.decisions)) {
        data.decisions.forEach((decision) => {
          const option = document.createElement("option");
          option.value = decision.id_decision;
          const prenom = decision.prenom ? decision.prenom : "";
          option.innerText = `${decision.nom} ${prenom}`.trim();
          decisionInput.appendChild(option);
        });
      } else {
        const option = document.createElement("option");
        option.value = "";
        option.innerText = "Aucune décision trouvée";
        decisionInput.appendChild(option);
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des décisions :", error);
      const option = document.createElement("option");
      option.value = "";
      option.innerText = "Erreur de chargement des décisions";
      decisionInput.appendChild(option);
    });

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date du recours :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_recours";
  dateInput.required = true; // Rend le champ date obligatoire

  const typeAuteurLabel = document.createElement("label");
  typeAuteurLabel.innerText = "Type d'auteur :";
  const typeAuteurInput = document.createElement("select");
  typeAuteurInput.name = "type_auteur_recours";
  const typeAuteurOptions = ["Contrevenant", "Parquet"];
  typeAuteurOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    typeAuteurInput.appendChild(option);
  });

  const auteurLabel = document.createElement("label");
  auteurLabel.innerText = "Auteur du recours :";
  const auteurInput = document.createElement("select");
  auteurInput.name = "auteur_recours";

  typeAuteurInput.addEventListener("change", function () {
    const selectedType = typeAuteurInput.value;

    while (auteurInput.firstChild) {
      auteurInput.removeChild(auteurInput.firstChild);
    }

    let fetchUrl = "";
    if (selectedType === "Contrevenant") {
      fetchUrl = `../pages/script/recours/script_contrevenants.php?id=${dossierId}`;
    } else if (selectedType === "Parquet") {
      fetchUrl = `../pages/script/recours/script_parquets.php?id=${dossierId}`;
    }

    fetch(fetchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur HTTP, statut : " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (
          (data && Array.isArray(data.contrevenants)) ||
          Array.isArray(data.parquets)
        ) {
          if (selectedType === "Contrevenant") {
            data.contrevenants.forEach((contrevenant) => {
              const option = document.createElement("option");
              option.value = contrevenant.id_contrevenant;
              const prenom = contrevenant.prenom ? contrevenant.prenom : "";
              option.innerText = `${contrevenant.nom} ${prenom}`.trim();
              auteurInput.appendChild(option);
            });
          } else if (selectedType === "Parquet") {
            data.parquets.forEach((parquet) => {
              const option = document.createElement("option");
              option.value = parquet.id_parquet;
              option.innerText = parquet.parquet;
              auteurInput.appendChild(option);
            });
          }
        } else {
          const option = document.createElement("option");
          option.value = "";
          option.innerText = `Aucun ${selectedType.toLowerCase()} trouvé`;
          auteurInput.appendChild(option);
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des auteurs :", error);
        const option = document.createElement("option");
        option.value = "";
        option.innerText = "Erreur de chargement des auteurs";
        auteurInput.appendChild(option);
      });
  });

  const typeLabel = document.createElement("label");
  typeLabel.innerText = "Type de recours :";
  const typeInput = document.createElement("select");
  typeInput.name = "type_recours";
  const typeOptions = ["Opposition", "Appel", "Pourvoi en cassation"];
  typeOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    typeInput.appendChild(option);
  });

  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_recours";

  formContainer.appendChild(titreRecours);
  formContainer.appendChild(decisionLabel);
  formContainer.appendChild(decisionInput);
  formContainer.appendChild(dateLabel);
  formContainer.appendChild(dateInput);
  formContainer.appendChild(typeAuteurLabel);
  formContainer.appendChild(typeAuteurInput);
  formContainer.appendChild(auteurLabel);
  formContainer.appendChild(auteurInput);
  formContainer.appendChild(typeLabel);
  formContainer.appendChild(typeInput);
  formContainer.appendChild(observationsLabel);
  formContainer.appendChild(observationsInput);

  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";

  submitButton.addEventListener("click", function () {
    // Vérifier si la date est remplie avant de soumettre
    if (!dateInput.value) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez remplir la date du recours.",
      });
      return; // Arrêter la soumission du formulaire si la date n'est pas remplie
    }

    const decisionValue = decisionInput.value;
    const dateValue = dateInput.value;
    const auteurValue = auteurInput.value;
    const typeValue = typeInput.value;
    const observationsValue = observationsInput.value;

    const formData = new FormData();
    formData.append("decision", decisionValue);
    formData.append("date", dateValue);
    formData.append("auteur", auteurValue);
    formData.append("type", typeValue);
    formData.append("observations", observationsValue);

    // Ajouter le type d'auteur et son ID au formulaire
    formData.append("type_auteur", typeAuteurInput.value);
    if (typeAuteurInput.value === "Contrevenant") {
      formData.append("id_auteur", auteurInput.value);
    } else if (typeAuteurInput.value === "Parquet") {
      formData.append("id_auteur", auteurInput.value);
    }

    fetch(`../pages/script/recours/script_creation_recours.php`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur HTTP, statut : " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Succès",
            text: data.message,
            confirmButtonText: "OK",
          }).then(() => {
            location.reload(); // Rafraîchir la page
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: data.message,
          });
        }
      })
      .catch((error) => {
        console.error(
          "Erreur lors de l'envoi des données du formulaire :",
          error
        );
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Erreur lors de l'envoi des données du formulaire.",
        });
      });
  });

  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.addEventListener("click", function () {
    Swal.close();
  });

  formContainer.appendChild(submitButton);
  formContainer.appendChild(closeButton);

  Swal.fire({
    html: formContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
    didOpen: () => {
      const modalContainer = Swal.getPopup();
      if (modalContainer) {
        modalContainer.classList.add("recours-popup-cont");
      }
    },
  });
}
