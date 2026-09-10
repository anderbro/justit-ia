document.addEventListener("DOMContentLoaded", function () {
  const btnAjouterAudience = document.getElementById("btnAjouterAudience");

  btnAjouterAudience.addEventListener("click", function () {
    showPopupFormAudience();
  });

  fetch(`../pages/script/audience/script_audience.php?id=${dossierId}`, {
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
      const tableAudienceBody = document.getElementById("tableAudienceBody");

      tableAudienceBody.innerHTML = "";

      if (data.success && data.audiences && data.audiences.length > 0) {
        data.audiences.forEach((audience) => {
          const newRow = tableAudienceBody.insertRow();

          const dateCell = newRow.insertCell(0);
          dateCell.innerText = audience.audience_date;

          const juridictionCell = newRow.insertCell(1);
          juridictionCell.innerText = audience.audience_juridiction;

          const typeProcCell = newRow.insertCell(2);
          typeProcCell.innerText = audience.audience_type_proc;

          const objetCell = newRow.insertCell(3);
          objetCell.innerText = audience.audience_objet;

          const suitesCell = newRow.insertCell(4);
          suitesCell.innerText = audience.audience_suite;

          const observationsCell = newRow.insertCell(5);
          observationsCell.innerText = audience.audience_observation;

          const actionCell = newRow.insertCell(6);
          actionCell.classList.add("bouton-tab-cont-audience");

          const modifyButton = document.createElement("button");
          modifyButton.classList = "bouton-modification-audience";
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            showAudiencePopupPourModif(audience);
          });
          actionCell.appendChild(modifyButton);

          const deleteButton = document.createElement("button");
          deleteButton.classList = "bouton-suppression-audience";
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer cette audience?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteAudience(audience.id_audience);
              }
            });
          });
          actionCell.appendChild(deleteButton);
        });
      } else {
        const noDataMessage = document.createElement("tr");
        noDataMessage.innerHTML =
          '<td colspan="7">Aucune audience trouvée.</td>';
        tableAudienceBody.appendChild(noDataMessage);
      }
    });
});

function showPopupFormAudience() {
  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "audience-form");

  const titre_audience = document.createElement("h1");
  titre_audience.innerText = "Audience";
  titre_audience.id = "titre_audience";

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date audience :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_audience";

  const juridictionLabel = document.createElement("label");
  juridictionLabel.innerText = "Juridiction :";
  const juridictionInput = document.createElement("select");
  juridictionInput.name = "juridiction";
  juridictionInput.id = "juridiction";
  const juridictionOptions = [
    "TJ Montpellier",
    "TJ Béziers",
    "CA Montpellier",
    "Cours de cassation",
    "Autre juridiction",
  ];
  juridictionOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    juridictionInput.appendChild(option);
  });

  const typeProcLabel = document.createElement("label");
  typeProcLabel.innerText = "Type de procédure :";
  const typeProcInput = document.createElement("select");
  typeProcInput.name = "type_procedure";
  typeProcInput.id = "type_procedure";
  const typeProcOptions = [
    "Correctionnel",
    "Référé expulsion",
    "Juge de l'exécution",
    "Autre",
  ];
  typeProcOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    typeProcInput.appendChild(option);
  });

  const objetLabel = document.createElement("label");
  objetLabel.innerText = "Objet de l'audience :";
  const objetInput = document.createElement("textarea");
  objetInput.name = "objet_audience";
  objetInput.id = "objet_audience";

  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_audience";
  observationsInput.id = "observations_audience";

  const suitesLabel = document.createElement("label");
  suitesLabel.innerText = "Suites de l'audience :";
  const suitesInput = document.createElement("select");
  suitesInput.name = "suites_audience";
  suitesInput.id = "suites_audience";

  const suitesOptions = [
    { text: "---", value: "null" },
    { text: "A reciter", value: "a_reciter" },
    { text: "Renvoi", value: "renvoi" },
    { text: "Renvoi délibéré", value: "renvoi_delibere" },
    {
      text: "Renvoi ajournement sur peine",
      value: "renvoi_ajournement_sur_peine",
    },
  ];
  suitesOptions.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.text;
    suitesInput.appendChild(optionElement);
  });

  const dateRenvoiContainer = document.createElement("div");
  dateRenvoiContainer.style.display = "none";

  const dateRenvoiLabel = document.createElement("label");
  dateRenvoiLabel.innerText = "Date de renvoi :";
  const dateRenvoiInput = document.createElement("input");
  dateRenvoiInput.type = "date";
  dateRenvoiInput.name = "date_renvoi";

  dateRenvoiContainer.appendChild(dateRenvoiLabel);
  dateRenvoiContainer.appendChild(dateRenvoiInput);

  suitesInput.addEventListener("change", function () {
    dateRenvoiContainer.style.display = suitesInput.value.startsWith("renvoi")
      ? "block"
      : "none";
  });

  formContainer.appendChild(titre_audience);
  formContainer.appendChild(dateLabel);
  formContainer.appendChild(dateInput);
  formContainer.appendChild(juridictionLabel);
  formContainer.appendChild(juridictionInput);
  formContainer.appendChild(typeProcLabel);
  formContainer.appendChild(typeProcInput);
  formContainer.appendChild(objetLabel);
  formContainer.appendChild(objetInput);
  formContainer.appendChild(suitesLabel);
  formContainer.appendChild(suitesInput);
  formContainer.appendChild(dateRenvoiContainer);
  formContainer.appendChild(observationsLabel);
  formContainer.appendChild(observationsInput);

  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.type = "button";
  submitButton.addEventListener("click", function () {
    creationAudience({
      date_audience: dateInput.value,
      juridiction: juridictionInput.value,
      type_procedure: typeProcInput.value,
      objet_audience: objetInput.value,
      observations_audience: observationsInput.value,
      suites_audience: suitesInput.value,
      date_renvoi: dateRenvoiInput.value,
      id_dossier: dossierId,
    });
  });

  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.type = "button";
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
        modalContainer.classList.add("audience-popup-cont");
      }
    },
  });
}

function deleteAudience(audienceId) {
  fetch(
    `../pages/script/audience/script_supprimer_audience.php?id=${audienceId}`,
    {
      method: "DELETE",
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
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Audience supprimée avec succès!",
        }).then(() => {
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la suppression de l'audience.",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur s'est produite : " + error.message,
      });
    });
}

function creationAudience(audienceData) {
  const formData = new FormData();
  Object.entries(audienceData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  fetch("../pages/script/audience/script_creation_audience.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Formulaire d'audience soumis avec succès !",
        }).then(() => {
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la soumission du formulaire.",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur s'est produite : " + error.message,
      });
    });
}
function showAudiencePopupPourModif(audience) {
  // Créer les éléments HTML du formulaire d'audience
  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "audience-form");

  // Titre du formulaire
  const titre_audience = document.createElement("h1");
  titre_audience.innerText = "Modifier Audience";
  titre_audience.id = "titre_audience";

  // Date de l'audience
  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date audience :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_audience";
  dateInput.value = audience.audience_date;

  // Juridiction
  const juridictionLabel = document.createElement("label");
  juridictionLabel.innerText = "Juridiction :";
  const juridictionInput = document.createElement("select");
  juridictionInput.name = "juridiction";
  juridictionInput.id = "juridiction";
  const juridictionOptions = [
    { text: "TJ Montpellier", value: "TJ Montpellier" },
    { text: "TJ Béziers", value: "TJ Béziers" },
    { text: "CA Montpellier", value: "CA Montpellier" },
    { text: "Cours de cassation", value: "Cours de cassation" },
    { text: "Autre juridiction", value: "Autre juridiction" },
  ];
  juridictionOptions.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.text;
    if (audience && option.text === audience.audience_juridiction) {
      optionElement.selected = true;
    }
    juridictionInput.appendChild(optionElement);
  });

  // Type de procédure
  const typeProcLabel = document.createElement("label");
  typeProcLabel.innerText = "Type de procédure :";
  const typeProcInput = document.createElement("select");
  typeProcInput.name = "type_procedure";
  typeProcInput.id = "type_procedure";
  const typeProcOptions = [
    { text: "Correctionnel", value: "correctionnel" },
    { text: "Référé expulsion", value: "refere_expulsion" },
    { text: "Juge de l'exécution", value: "juge_de_l_execution" },
    { text: "Autre", value: "autre" },
  ];
  typeProcOptions.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.text;
    if (audience && option.text === audience.audience_type_proc) {
      optionElement.selected = true;
    }
    typeProcInput.appendChild(optionElement);
  });
  // Objet de l'audience
  const objetLabel = document.createElement("label");
  objetLabel.innerText = "Objet de l'audience :";
  const objetInput = document.createElement("textarea");
  objetInput.name = "objet_audience";
  objetInput.id = "objet_audience";
  objetInput.value = audience.audience_objet;

  // Observations
  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_audience";
  observationsInput.id = "observations_audience";
  observationsInput.value = audience.audience_observation;

  // Suites de l'audience
  const suitesLabel = document.createElement("label");
  suitesLabel.innerText = "Suites de l'audience :";
  const suitesInput = document.createElement("select");
  suitesInput.name = "suites_audience";
  suitesInput.id = "suites_audience";
  const suitesOptions = [
    { text: "---", value: "null" },
    { text: "A reciter", value: "a_reciter" },
    { text: "Renvoi", value: "renvoi" },
    { text: "Renvoi délibéré", value: "renvoi_delibere" },
    {
      text: "Renvoi ajournement sur peine",
      value: "renvoi_ajournement_sur_peine",
    },
  ];
  suitesOptions.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.text = option.text;
    if (audience && option.text === audience.audience_suite) {
      optionElement.selected = true;
    }
    suitesInput.appendChild(optionElement);
  });
  // Date de renvoi
  const dateRenvoiContainer = document.createElement("div");
  dateRenvoiContainer.style.display = audience.audience_suite.startsWith(
    "renvoi"
  )
    ? "block"
    : "none";

  const dateRenvoiLabel = document.createElement("label");
  dateRenvoiLabel.innerText = "Date de renvoi :";
  const dateRenvoiInput = document.createElement("input");
  dateRenvoiInput.type = "date";
  dateRenvoiInput.name = "date_renvoi";
  dateRenvoiInput.value = audience.audience_date_renvoi || "";
  dateRenvoiContainer.appendChild(dateRenvoiLabel);
  dateRenvoiContainer.appendChild(dateRenvoiInput);

  suitesInput.addEventListener("change", function () {
    dateRenvoiContainer.style.display = suitesInput.value.startsWith("renvoi")
      ? "block"
      : "none";
  });

  // Ajouter les champs au formulaire
  formContainer.appendChild(titre_audience);
  formContainer.appendChild(dateLabel);
  formContainer.appendChild(dateInput);
  formContainer.appendChild(juridictionLabel);
  formContainer.appendChild(juridictionInput);
  formContainer.appendChild(typeProcLabel);
  formContainer.appendChild(typeProcInput);
  formContainer.appendChild(objetLabel);
  formContainer.appendChild(objetInput);
  formContainer.appendChild(suitesLabel);
  formContainer.appendChild(suitesInput);
  formContainer.appendChild(dateRenvoiContainer);
  formContainer.appendChild(observationsLabel);
  formContainer.appendChild(observationsInput);

  // Bouton de soumission
  const submitButton = document.createElement("button");
  submitButton.innerText = "Modifier";
  submitButton.type = "button"; // Assurez-vous que le bouton n'est pas de type "submit"
  submitButton.addEventListener("click", function () {
    // Récupérer le texte des options sélectionnées
    const juridictionText =
      juridictionInput.options[juridictionInput.selectedIndex].text;
    const typeProcText =
      typeProcInput.options[typeProcInput.selectedIndex].text;
    const suitesText = suitesInput.options[suitesInput.selectedIndex].text;

    modificationAudience(audience.id_audience, {
      date_audience: dateInput.value,
      juridiction: juridictionText,
      type_procedure: typeProcText,
      objet_audience: objetInput.value,
      observations_audience: observationsInput.value,
      suites_audience: suitesText,
      date_renvoi: dateRenvoiInput.value,
    });
  });

  // Bouton de fermeture
  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.type = "button";
  closeButton.addEventListener("click", function () {
    Swal.close();
  });

  formContainer.appendChild(submitButton);
  formContainer.appendChild(closeButton);

  // Afficher le formulaire dans une popup avec Swal
  Swal.fire({
    html: formContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
    didOpen: () => {
      const modalContainer = Swal.getPopup();
      if (modalContainer) {
        modalContainer.classList.add("audience-popup-cont");
      }
    },
  });
}

function modificationAudience(audienceId, audienceData) {
  console.log("audience data pour modif : ", audienceData);
  console.log("audience ID pour modif : ", audienceId);

  const formData = new FormData();
  for (const key in audienceData) {
    formData.append(key, audienceData[key]);
  }
  formData.append("id_audience", audienceId);

  // Parcourir et afficher le contenu de formData pour le débogage
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  fetch(
    `../pages/script/audience/script_modifier_audience.php?id=${audienceId}`,
    {
      method: "POST",
      body: formData,
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Audience modifiée avec succès!",
        }).then(() => {
          Swal.close();
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la modification de l'audience.",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur s'est produite : " + error.message,
      });
    });
}
