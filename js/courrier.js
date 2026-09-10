document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");

  const btnNouveauCourrier = document.getElementById("btnNouveauCourrier");

  btnNouveauCourrier.addEventListener("click", function () {
    showPopupFormCourrier();
  });
  loadCourriers(dossierId);
});

function loadCourriers(idDossier) {
  fetch(
    `../pages/script/courrier/script_details_courrier.php?id_dossier=${idDossier}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }

      return response.json();
    })
    .then((data) => {
      // console.log(data);
      const tableCourriersBody = document.querySelector(
        "#table-courriers tbody"
      );

      tableCourriersBody.innerHTML = "";

      if (
        data.status === "success" &&
        data.courriers &&
        data.courriers.length > 0
      ) {
        data.courriers.forEach((courrier) => {
          const newRow = tableCourriersBody.insertRow();

          const dateCell = newRow.insertCell(0);
          dateCell.innerText = courrier.courrier_date;

          const redacteurCell = newRow.insertCell(1);
          // redacteurCell.innerText = courrier.redacteur_nom
          const objetCell = newRow.insertCell(2);
          objetCell.innerText = courrier.courrier_objet;

          const observationsCell = newRow.insertCell(3);
          observationsCell.innerText = courrier.courrier_observation;

          const actionCell = newRow.insertCell(4);
          actionCell.classList.add("bouton-tab-cont-courrier");

          const modifyButton = document.createElement("button");
          modifyButton.classList = "bouton-modification-courrier";
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            showCourrierPopupPourModif(courrier);
          });
          actionCell.appendChild(modifyButton);

          const deleteButton = document.createElement("button");
          deleteButton.classList = "bouton-suppression-courrier";
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer ce courrier?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteCourrier(courrier.id); // Appeler une fonction pour supprimer le courrier
              }
            });
          });
          actionCell.appendChild(deleteButton);
        });
      } else {
        const noDataMessage = document.createElement("tr");
        noDataMessage.innerHTML = '<td colspan="5">Aucun courrier trouvé.</td>';
        tableCourriersBody.appendChild(noDataMessage);
      }
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des courriers :", error);
    });
}

function showPopupFormCourrier() {
  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");

  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "courrier-form");

  const titre_courrier = document.createElement("h1");
  titre_courrier.innerText = "Nouveau Courrier";
  titre_courrier.id = "titre_courrier";

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date du courrier :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_courrier";

  const typeLabel = document.createElement("label");
  typeLabel.innerText = "Type de destinataire :";
  const typeSelect = document.createElement("select");
  typeSelect.name = "type_destinataire";
  const typeOptions = ["", "Agent", "Condamné"];
  typeOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    typeSelect.appendChild(option);
  });


  const destinataireLabel = document.createElement("label");
  destinataireLabel.innerText = "Destinataire :";
  const destinataireSelect = document.createElement("select");
  destinataireSelect.name = "destinataire";
  destinataireSelect.innerHTML = '<option value="">Sélectionner...</option>';

  function fetchAgents() {
    return fetch("../pages/script/agent/script_agents.php")
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.agents)) {
          return data.agents.map((agent) => ({
            id: agent.id,
            nom: `${agent.agent_nom} ${agent.agent_prenom}`.trim(),
          }));
        } else {
          throw new Error("Erreur lors de la récupération des agents");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des agents :", error);
        return [{ id: null, nom: "Erreur de chargement des agents" }];
      });
  }

  function fetchCondamnes() {
    return fetch(
      `../pages/script/contrevenant/script_details_contrevenant.php?id=${dossierId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.contrevenants)) {
          return data.contrevenants.map((contrevenant) => ({
            id: contrevenant.id_contrevenant,
            nom: `${contrevenant.nom} ${contrevenant.prenom || ""}`.trim(),
          }));
        } else {
          throw new Error("Erreur lors de la récupération des condamnés");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des condamnés :", error);
        return [{ id: null, nom: "Erreur de chargement des condamnés" }];
      });
  }

  typeSelect.addEventListener("change", function () {
    const selectedType = typeSelect.value;
    destinataireSelect.innerHTML = '<option value="">Sélectionner...</option>';

    if (selectedType === "Agent") {
      fetchAgents().then((agents) => {
        agents.forEach((agent) => {
          const option = document.createElement("option");
          option.value = agent.id;
          option.text = agent.nom;
          destinataireSelect.appendChild(option);
        });
      });
    } else if (selectedType === "Condamné") {
      fetchCondamnes().then((condamnes) => {
        condamnes.forEach((condamne) => {
          const option = document.createElement("option");
          option.value = condamne.id;
          option.text = condamne.nom;
          destinataireSelect.appendChild(option);
        });
      });
    }

    updateObjetOptions(selectedType);
  });

  function updateObjetOptions(selectedType) {
    const objetInput = document.getElementById("objet_courrier");
    objetInput.innerHTML = "";

    const optionsObjet = {
      Agent: [
        "Courrier annonce astreinte",
        "Courrier",
        "Réponse à recours gracieux (rejet)",
        "Recours gracieux (fait choix)",
      ],
      Condamné: ["Courrier", "Recours gracieux"],
    };

    const options = optionsObjet[selectedType];

    options.forEach((optionText) => {
      const option = document.createElement("option");
      option.text = optionText;
      objetInput.appendChild(option);
    });
  }

  typeSelect.dispatchEvent(new Event("change"));

  const objetLabel = document.createElement("label");
  objetLabel.innerText = "Objet :";
  const objetInput = document.createElement("select");
  objetInput.name = "objet_courrier";
  objetInput.id = "objet_courrier";

  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_courrier";

  formContainer.appendChild(titre_courrier);
  formContainer.appendChild(dateLabel);
  formContainer.appendChild(dateInput);
  formContainer.appendChild(typeLabel);
  formContainer.appendChild(typeSelect);
  formContainer.appendChild(destinataireLabel);
  formContainer.appendChild(destinataireSelect);
  formContainer.appendChild(objetLabel);
  formContainer.appendChild(objetInput);
  formContainer.appendChild(observationsLabel);
  formContainer.appendChild(observationsInput);

  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.addEventListener("click", function () {
    creationCourrier(dossierId); // Appel de la fonction creationCourrier avec id_dossier
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
        modalContainer.classList.add("courrier-popup-cont");
      }
    },
  });
}

function creationCourrier(idDossier) {
  const formContainer = document.querySelector(".popup-form.courrier-form");

  const dateCourrier = formContainer.querySelector(
    "input[name='date_courrier']"
  ).value;
  const typeDestinataire = formContainer.querySelector(
    "select[name='type_destinataire']"
  ).value;
  const destinataire = formContainer.querySelector(
    "select[name='destinataire']"
  ).value;
  const objetCourrier = formContainer.querySelector(
    "select[name='objet_courrier']"
  ).value;
  const observationsCourrier = formContainer.querySelector(
    "textarea[name='observations_courrier']"
  ).value;

  const formData = new FormData();
  formData.append("date_courrier", dateCourrier);
  formData.append("type_destinataire", typeDestinataire);
  formData.append("destinataire", destinataire);
  formData.append("objet_courrier", objetCourrier);
  formData.append("observations_courrier", observationsCourrier);
  formData.append("id_dossier", idDossier); // Ajoutez id_dossier aux données envoyées

  fetch("../pages/script/courrier/script_creation_courrier.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
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
      console.error("Erreur lors de l'envoi du courrier :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Erreur lors de l'envoi du courrier : " + error.message,
      });
    });
}

function showCourrierPopupPourModif(courrier) {
  console.log("courrier envoyé dans modif pour préremplir : ",courrier);
  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "courrier-form");

  const titre_courrier = document.createElement("h1");
  titre_courrier.innerText = "Modification du Courrier";
  titre_courrier.id = "titre_courrier";

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date du courrier :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_courrier";
  dateInput.value = courrier.courrier_date; // Pré-remplir avec la valeur existante

  const typeLabel = document.createElement("label");
  typeLabel.innerText = "Type de destinataire :";
  const typeSelect = document.createElement("select");
  typeSelect.name = "type_destinataire";
  const typeOptions = ["Agent", "Condamné"];
  typeOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    typeSelect.appendChild(option);
  });
  if (courrier.id){
    typeSelect.value = "Agent";
  }else if( courrier.id_contrevenant){
    typeSelect.value = "Condamné";
  } 
  const destinataireLabel = document.createElement("label");
  destinataireLabel.innerText = "Destinataire :";
  const destinataireSelect = document.createElement("select");
  destinataireSelect.name = "destinataire";
  



  if (courrier.type_destinataire === "Agent") {
    fetchAgents().then((agents) => {
      agents.forEach((agent) => {
        const option = document.createElement("option");
        option.value = agent.id;
        option.text = agent.nom;
        destinataireSelect.appendChild(option);
      });
      destinataireSelect.value = courrier.destinataire; // Pré-remplir avec la valeur existante
    });
  } else if (courrier.type_destinataire === "Condamné") {
    fetchCondamnes().then((condamnes) => {
      condamnes.forEach((condamne) => {
        const option = document.createElement("option");
        option.value = condamne.id;
        option.text = condamne.nom;
        destinataireSelect.appendChild(option);
      });
      destinataireSelect.value = courrier.nom + " " + courrier.prenom; // Pré-remplir avec la valeur existante
    });
  }
  function fetchAgents() {
    return fetch("../pages/script/agent/script_agents.php")
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.agents)) {
          return data.agents.map((agent) => ({
            id: agent.id,
            nom: `${agent.agent_nom} ${agent.agent_prenom}`.trim(),
          }));
        } else {
          throw new Error("Erreur lors de la récupération des agents");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des agents :", error);
        return [{ id: null, nom: "Erreur de chargement des agents" }];
      });
  }

  function fetchCondamnes() {
    return fetch(
      `../pages/script/contrevenant/script_details_contrevenant.php?id=${dossierId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.contrevenants)) {
          return data.contrevenants.map((contrevenant) => ({
            id: contrevenant.id_contrevenant,
            nom: `${contrevenant.nom} ${contrevenant.prenom || ""}`.trim(),
          }));
        } else {
          throw new Error("Erreur lors de la récupération des condamnés");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des condamnés :", error);
        return [{ id: null, nom: "Erreur de chargement des condamnés" }];
      });
  }

  typeSelect.addEventListener("change", function () {
    const selectedType = typeSelect.value;
    destinataireSelect.innerHTML = '<option value="">Sélectionner...</option>';

    if (selectedType === "Agent") {
      fetchAgents().then((agents) => {
        agents.forEach((agent) => {
          const option = document.createElement("option");
          option.value = agent.id;
          option.text = agent.nom;
          destinataireSelect.appendChild(option);
        });
      });
    } else if (selectedType === "Condamné") {
      fetchCondamnes().then((condamnes) => {
        condamnes.forEach((condamne) => {
          const option = document.createElement("option");
          option.value = condamne.id;
          option.text = condamne.nom;
          destinataireSelect.appendChild(option);
        });
      });
    }

    updateObjetOptions(selectedType);
  });

  function updateObjetOptions(selectedType) {
    const objetInput = document.getElementById("objet_courrier");
    objetInput.innerHTML = "";

    const optionsObjet = {
      Agent: [
        "Courrier annonce astreinte",
        "Courrier",
        "Réponse à recours gracieux (rejet)",
        "Recours gracieux (fait choix)",
      ],
      Condamné: ["Courrier", "Recours gracieux"],
    };

    const options = optionsObjet[selectedType];

    options.forEach((optionText) => {
      const option = document.createElement("option");
      option.text = optionText;
      objetInput.appendChild(option);
    });
  }

  typeSelect.dispatchEvent(new Event("change"));


  const objetLabel = document.createElement("label");
  objetLabel.innerText = "Objet :";
  const objetInput = document.createElement("select");
  objetInput.name = "objet_courrier";
  objetInput.id = "objet_courrier";
  const objetOptions = ["Option 1", "Option 2", "Option 3"]; // Remplacez par les options réelles
  objetOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    objetInput.appendChild(option);
  });
  objetInput.value = courrier.objet_courrier; // Pré-remplir avec la valeur existante

  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_courrier";
  observationsInput.value = courrier.observations_courrier; // Pré-remplir avec la valeur existante

  formContainer.appendChild(titre_courrier);
  formContainer.appendChild(dateLabel);
  formContainer.appendChild(dateInput);
  formContainer.appendChild(typeLabel);
  formContainer.appendChild(typeSelect);
  formContainer.appendChild(destinataireLabel);
  formContainer.appendChild(destinataireSelect);
  formContainer.appendChild(objetLabel);
  formContainer.appendChild(objetInput);
  formContainer.appendChild(observationsLabel);
  formContainer.appendChild(observationsInput);

  const submitButton = document.createElement("button");
  submitButton.innerText = "Modifier";
  submitButton.addEventListener("click", function () {
    modifierCourrier(courrier.id); // Appel de la fonction modifierCourrier avec l'id du courrier
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
        modalContainer.classList.add("courrier-popup-cont");
      }
    },
  });
}

function modifierCourrier(idCourrier) {
  const formContainer = document.querySelector(".popup-form.courrier-form");

  const dateCourrier = formContainer.querySelector(
    "input[name='date_courrier']"
  ).value;
  const typeDestinataire = formContainer.querySelector(
    "select[name='type_destinataire']"
  ).value;
  const destinataire = formContainer.querySelector(
    "select[name='destinataire']"
  ).value;
  const objetCourrier = formContainer.querySelector(
    "select[name='objet_courrier']"
  ).value;
  const observationsCourrier = formContainer.querySelector(
    "textarea[name='observations_courrier']"
  ).value;

  const formData = new FormData();
  formData.append("id_courrier", idCourrier);
  formData.append("date_courrier", dateCourrier);
  formData.append("type_destinataire", typeDestinataire);
  formData.append("destinataire", destinataire);
  formData.append("objet_courrier", objetCourrier);
  formData.append("observations_courrier", observationsCourrier);

  fetch("../pages/script/courrier/script_modification_courrier.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
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
      console.error("Erreur lors de la modification du courrier :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Erreur lors de la modification du courrier : " + error.message,
      });
    });
}

function deleteCourrier(idCourrier) {
  fetch("../pages/script/courrier/script_suppression_courrier.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_courrier: idCourrier }),
  })
    .then((response) => response.json())
    .then((data) => {
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
      console.error("Erreur lors de la suppression du courrier :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Erreur lors de la suppression du courrier : " + error.message,
      });
    });
}
