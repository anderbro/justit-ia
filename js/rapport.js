document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");
  const btnNouveauRapport = document.getElementById("btnNouveauRapport");

  btnNouveauRapport.addEventListener("click", function () {
    showPopupFormRapport();
  });

  loadRapport(dossierId);
});

function loadRapport(idDossier) {
  fetch(
    `../pages/script/rapport/script_details_rapport.php?id_dossier=${idDossier}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const tableRapportsBody = document.querySelector("#table-rapports tbody");

      tableRapportsBody.innerHTML = ""; // Vider le corps du tableau

      if (
        data.status === "success" &&
        data.rapports &&
        data.rapports.length > 0
      ) {
        data.rapports.forEach((rapport) => {
          const newRow = tableRapportsBody.insertRow();

          const dateCell = newRow.insertCell(0);
          dateCell.innerText = rapport.rapport_date;

          const redacteurCell = newRow.insertCell(1);
          redacteurCell.innerText = rapport.rapport_emetteur;

          const objetCell = newRow.insertCell(2);
          objetCell.innerText = rapport.rapport_objet;

          const observationsCell = newRow.insertCell(3);
          observationsCell.innerText = rapport.rapport_observation;

          const actionCell = newRow.insertCell(4);
          actionCell.classList.add("bouton-tab-cont-rapport");

          const modifyButton = document.createElement("button");
          modifyButton.classList = "bouton-modification-rapport";
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            showRapportPopupPourModif(rapport);
          });
          actionCell.appendChild(modifyButton);

          const deleteButton = document.createElement("button");
          deleteButton.classList = "bouton-suppression-rapport";
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer ce rapport?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteRapport(rapport.id); // Appeler une fonction pour supprimer le rapport
              }
            });
          });
          actionCell.appendChild(deleteButton);
        });
      } else {
        const noDataMessage = document.createElement("tr");
        noDataMessage.innerHTML = '<td colspan="5">Aucun rapport trouvé.</td>';
        tableRapportsBody.appendChild(noDataMessage);
      }
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des rapports :", error);
      Swal.fire({
        title: "Erreur",
        text: "Une erreur s'est produite lors du chargement des rapports.",
        icon: "error",
      });
    });
}

function showPopupFormRapport() {
  // Créer les éléments HTML du formulaire de rapport
  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "rapport-form");

  // Titre du formulaire
  const titre_rapport = document.createElement("h1");
  titre_rapport.innerText = "Nouveau Rapport";
  titre_rapport.id = "titre_rapport";

  // Champ pour la date du rapport
  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date du rapport :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_rapport";

  // Champ pour sélectionner rédacteur / émetteur
  const redacteurLabel = document.createElement("label");
  redacteurLabel.innerText = "Rédacteur / Emetteur :";
  const redacteurSelect = document.createElement("select");
  redacteurSelect.name = "redacteur_emetteur";

  // Champ pour l'objet du rapport
  const objetLabel = document.createElement("label");
  objetLabel.innerText = "Objet :";
  const objetInput = document.createElement("select");
  objetInput.name = "objet_rapport";

  // Champ pour les observations
  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_rapport";

  // Champ texte supplémentaire pour rédacteur / émetteur "Autre"
  const autreRedacteurLabel = document.createElement("label");
  autreRedacteurLabel.innerText = "Nom du rédacteur / émetteur :";
  const autreRedacteurInput = document.createElement("input");
  autreRedacteurInput.type = "text";
  autreRedacteurInput.name = "autre_redacteur";
  autreRedacteurLabel.style.display = "none"; // Caché par défaut
  autreRedacteurInput.style.display = "none"; // Caché par défaut

  // Ajouter les champs au formulaire
  formContainer.appendChild(titre_rapport);
  formContainer.appendChild(dateLabel);
  formContainer.appendChild(dateInput);
  formContainer.appendChild(redacteurLabel);
  formContainer.appendChild(redacteurSelect);
  formContainer.appendChild(autreRedacteurLabel);
  formContainer.appendChild(autreRedacteurInput);
  formContainer.appendChild(objetLabel);
  formContainer.appendChild(objetInput);
  formContainer.appendChild(observationsLabel);
  formContainer.appendChild(observationsInput);

  // Créer et ajouter les boutons "Soumettre" et "Fermer"
  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.addEventListener("click", function () {
    const idDossier = document.getElementById("id_dossier").value; // Récupérer l'id_dossier depuis un champ caché ou un élément du DOM
    const formData = {
      date_rapport: dateInput.value,
      redacteur_emetteur: redacteurSelect.value,
      autre_redacteur: autreRedacteurInput.value,
      objet_rapport: objetInput.value,
      observations_rapport: observationsInput.value,
      id_dossier: idDossier,
    };
    console.log(formData);
    creationRapport(formData);
  });

  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.addEventListener("click", function () {
    Swal.close();
  });

  formContainer.appendChild(submitButton);
  formContainer.appendChild(closeButton);

  // Afficher la popup avec le formulaire de rapport
  Swal.fire({
    html: formContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
    didOpen: () => {
      // Ajouter une classe personnalisée au conteneur de la fenêtre modale
      const modalContainer = Swal.getPopup();
      if (modalContainer) {
        modalContainer.classList.add("rapport-popup-cont");
      }
    },
  });

  // Options pour rédacteur / émetteur, initialisées après récupération des agents
  fetchAgents().then((agents) => {
    agents.forEach((agent) => {
      const option = document.createElement("option");
      option.text = agent;
      redacteurSelect.appendChild(option);
    });

    // Ajouter l'option "DDTM"
    const optionDDTM = document.createElement("option");
    optionDDTM.text = "DDTM";
    redacteurSelect.appendChild(optionDDTM);

    // Ajouter l'option "Autre" à la fin
    const autreOption = document.createElement("option");
    autreOption.text = "Autre";
    redacteurSelect.appendChild(autreOption);

    // Écouter les changements de sélection dans redacteurSelect
    redacteurSelect.addEventListener("change", function () {
      const selectedRedacteur = redacteurSelect.value;
      objetInput.innerHTML = ""; // Vider les options actuelles

      // Afficher ou cacher le champ "autreRedacteurLabel" en fonction de la sélection
      if (selectedRedacteur === "Autre") {
        autreRedacteurLabel.style.display = "block";
        autreRedacteurInput.style.display = "block";
      } else {
        autreRedacteurLabel.style.display = "none";
        autreRedacteurInput.style.display = "none";
      }

      // Mettre à jour les options de l'objet en fonction du rédacteur / émetteur sélectionné
      updateObjetOptions(selectedRedacteur, agents);
    });

    // Initialiser les options de l'objet et déclencher l'événement de changement
    redacteurSelect.dispatchEvent(new Event("change"));
  });
}

function fetchAgents() {
  return fetch("../pages/script/agent/script_agents.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      if (data && Array.isArray(data.agents)) {
        return data.agents.map((agent) =>
          `${agent.agent_nom} ${agent.agent_prenom}`.trim()
        );
      } else {
        throw new Error("Erreur lors de la récupération des agents");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des agents :", error);
      return ["Erreur de chargement des agents"];
    });
}

// Fonction pour mettre à jour les options de l'objet en fonction du rédacteur / émetteur sélectionné
function updateObjetOptions(selectedRedacteur, agents) {
  const objetInput = document.querySelector('select[name="objet_rapport"]');
  objetInput.innerHTML = ""; // Vider les options actuelles

  const optionsAgent = ["Demande de rapport", "Relance demande de rapport"];
  const optionsDDTM = [
    "Rapport de constatations",
    "Rapport de faisabilité",
    "PV d'obstacle du droit de visite",
  ];

  if (selectedRedacteur !== "DDTM" && selectedRedacteur !== "Autre") {
    optionsAgent.forEach((optionText) => {
      const option = document.createElement("option");
      option.text = optionText;
      objetInput.appendChild(option);
    });
  } else {
    optionsDDTM.forEach((optionText) => {
      const option = document.createElement("option");
      option.text = optionText;
      objetInput.appendChild(option);
    });
  }
}

function creationRapport(formData) {
  fetch("../pages/script/rapport/script_creation_rapport.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        Swal.fire({
          title: "Succès",
          text: "Le rapport a été créé avec succès.",
          icon: "success",
        });
        // Vous pouvez ajouter du code ici pour mettre à jour l'interface après la création du rapport
      } else {
        Swal.fire({
          title: "Erreur",
          text: data.message,
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la création du rapport :", error);
      Swal.fire({
        title: "Erreur",
        text: "Une erreur s'est produite lors de la création du rapport.",
        icon: "error",
      });
    });
}
