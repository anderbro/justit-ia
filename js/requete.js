document.addEventListener("DOMContentLoaded", function () {
  const btnNouveauRequete = document.getElementById("btnNouveauRequete");

  btnNouveauRequete.addEventListener("click", function () {
    showPopupFormRequete();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");
  loadRequetes(dossierId);
});

function loadRequetes(idDossier) {
  fetch(
    `../pages/script/requete/script_details_requete.php?id_dossier=${idDossier}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const tableRequetesBody = document.querySelector("#table-requetes tbody");

      tableRequetesBody.innerHTML = "";

      if (
        data.status === "success" &&
        data.requetes &&
        data.requetes.length > 0
      ) {
        data.requetes.forEach((requete) => {
          const newRow = tableRequetesBody.insertRow();

          const dateCell = newRow.insertCell(0);
          dateCell.innerText = requete.requete_date;

          const redacteurCell = newRow.insertCell(1);
          redacteurCell.innerText = requete.requete_emetteur;

          const objetCell = newRow.insertCell(2);
          objetCell.innerText = requete.requete_objet;

          const observationsCell = newRow.insertCell(3);
          observationsCell.innerText = requete.requete_observations;

          const actionCell = newRow.insertCell(4);
          actionCell.classList.add("bouton-tab-cont-requete");

          const modifyButton = document.createElement("button");
          modifyButton.classList.add("bouton-modification-requete");
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            showRequetePopupPourModif(requete);
          });
          actionCell.appendChild(modifyButton);

          const deleteButton = document.createElement("button");
          deleteButton.classList.add("bouton-suppression-requete");
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer cette requête?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteRequete(requete.id);
              }
            });
          });
          actionCell.appendChild(deleteButton);
        });
      } else {
        const noDataMessage = document.createElement("tr");
        noDataMessage.innerHTML =
          '<td colspan="5">Aucune requête trouvée.</td>';
        tableRequetesBody.appendChild(noDataMessage);
      }
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des requêtes :", error);
    });
}

function deleteRequete(requeteId) {
  fetch(`../pages/script/requete/script_delete_requete.php?id=${requeteId}`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Supprimé!",
          text: data.message,
          confirmButtonText: "OK",
        }).then(() => {
          location.reload();
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
      console.error("Erreur lors de la suppression de la requête :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Erreur lors de la suppression de la requête : " + error.message,
      });
    });
}
function showPopupFormRequete() {
  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");

  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "requete-form");

  const titre_requete = document.createElement("h1");
  titre_requete.innerText = "Nouvelle Requête";
  titre_requete.id = "titre_requete";

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date de la requête :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_requete";

  const objetLabel = document.createElement("label");
  objetLabel.innerText = "Objet :";
  const objetInput = document.createElement("select");
  objetInput.name = "objet_requete";
  objetInput.id = "objet_requete";
  const objetOptions = [
    "Requete sur astreinte en rectification",
    "Avis à parquet",
    "Décision sur requete",
  ];
  objetOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    objetInput.appendChild(option);
  });

  const redacteurLabel = document.createElement("label");
  redacteurLabel.innerText = "Rédacteur émetteur :";
  const redacteurInput = document.createElement("select");
  redacteurInput.name = "redacteur_emetteur";
  redacteurInput.id = "redacteur_emetteur";

  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_requete";

  function fetchAgents() {
    return fetch("../pages/script/agent/script_agents.php")
      .then((response) => response.json())
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

  function fetchContrevenants() {
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

  objetInput.addEventListener("change", function () {
    const selectedObjet = objetInput.value;
    redacteurInput.innerHTML = "";

    if (selectedObjet === "Requete sur astreinte en rectification") {
      fetchAgents().then((agents) => {
        agents.forEach((agent) => {
          const option = document.createElement("option");
          option.text = agent;
          redacteurInput.appendChild(option);
        });
      });
      fetchContrevenants().then((contrevenants) => {
        contrevenants.forEach((contrevenant) => {
          const option = document.createElement("option");
          option.text = contrevenant.nom;
          redacteurInput.appendChild(option);
        });
      });
    } else if (selectedObjet === "Avis à parquet") {
      fetchAgents().then((agents) => {
        agents.forEach((agent) => {
          const option = document.createElement("option");
          option.text = agent;
          redacteurInput.appendChild(option);
        });
      });
    } else if (selectedObjet === "Décision sur requete") {
      const options = ["TJ", "CA", "CC"];
      options.forEach((optionText) => {
        const option = document.createElement("option");
        option.text = optionText;
        redacteurInput.appendChild(option);
      });
    }
  });

  objetInput.dispatchEvent(new Event("change"));

  formContainer.appendChild(titre_requete);
  formContainer.appendChild(dateLabel);
  formContainer.appendChild(dateInput);
  formContainer.appendChild(objetLabel);
  formContainer.appendChild(objetInput);
  formContainer.appendChild(redacteurLabel);
  formContainer.appendChild(redacteurInput);
  formContainer.appendChild(observationsLabel);
  formContainer.appendChild(observationsInput);

  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.addEventListener("click", function () {
    creationRequete(dossierId);
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
        modalContainer.classList.add("requete-popup-cont");
      }
    },
  });
}

function creationRequete(dossierId) {
  const formContainer = document.querySelector(".popup-form.requete-form");

  const dateRequete = formContainer.querySelector(
    "input[name='date_requete']"
  ).value;
  const objetRequete = formContainer.querySelector(
    "select[name='objet_requete']"
  ).value;
  const redacteurEmetteur = formContainer.querySelector(
    "select[name='redacteur_emetteur']"
  ).value;
  const observationsRequete = formContainer.querySelector(
    "textarea[name='observations_requete']"
  ).value;

  const formData = new FormData();
  formData.append("date_requete", dateRequete);
  formData.append("objet_requete", objetRequete);
  formData.append("redacteur_emetteur", redacteurEmetteur);
  formData.append("observations_requete", observationsRequete);
  formData.append("id_dossier", dossierId);

  // const formDataObject = {};
  // formData.forEach((value, key) => {
  //   formDataObject[key] = value;
  // });
  // console.log("FormData values:", formDataObject);

  fetch("../pages/script/requete/script_creation_requete.php", {
    method: "POST",
    body: formData,
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
          location.reload();
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
      console.error("Erreur lors de l'envoi de la requête :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Erreur lors de l'envoi de la requête : " + error.message,
      });
    });
}

function loadRequetes(idDossier) {
  fetch(
    `../pages/script/requete/script_details_requete.php?id_dossier=${idDossier}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      console.log(response);
      return response.json();
    })
    .then((data) => {
      const tableRequetesBody = document.querySelector("#table-requetes tbody");

      tableRequetesBody.innerHTML = "";

      if (
        data.status === "success" &&
        data.requetes &&
        data.requetes.length > 0
      ) {
        data.requetes.forEach((requete) => {
          const newRow = tableRequetesBody.insertRow();

          const dateCell = newRow.insertCell(0);
          dateCell.innerText = requete.requete_date;

          const objetCell = newRow.insertCell(1);
          objetCell.innerText = requete.requete_emetteur;

          const redacteurCell = newRow.insertCell(2);
          redacteurCell.innerText = requete.requete_objet;

          const observationsCell = newRow.insertCell(3);
          observationsCell.innerText = requete.requete_observation;

          const actionCell = newRow.insertCell(4);
          actionCell.classList.add("bouton-tab-cont-requete");

          const modifyButton = document.createElement("button");
          modifyButton.classList = "bouton-modification-requete";
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            showRequetePopupPourModif(requete);
          });
          actionCell.appendChild(modifyButton);

          const deleteButton = document.createElement("button");
          deleteButton.classList = "bouton-suppression-requete";
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer cette requête?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteRequete(requete.id);
              }
            });
          });
          actionCell.appendChild(deleteButton);
        });
      } else {
        const noDataMessage = document.createElement("tr");
        noDataMessage.innerHTML =
          '<td colspan="5">Aucune requête trouvée.</td>';
        tableRequetesBody.appendChild(noDataMessage);
      }
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des requêtes :", error);
    });
}
