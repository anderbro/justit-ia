document.addEventListener("DOMContentLoaded", function () {
  const btnNouveauRecouvrement = document.getElementById(
    "btnNouveauRecouvrement"
  );

  btnNouveauRecouvrement.addEventListener("click", function () {
    showPopupFormRecouvrement();
  });
});

function showPopupFormRecouvrement() {
  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");

  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "recouvrement-form");

  const titre_recouvrement = document.createElement("h1");
  titre_recouvrement.innerText = "Nouveau Recouvrement";
  titre_recouvrement.id = "titre_recouvrement";

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date de recouvrement :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_recouvrement";

  const agentLabel = document.createElement("label");
  agentLabel.innerText = "Agent :";
  const agentInput = document.createElement("select");
  agentInput.name = "agent_recouvrement";
  agentInput.id = "agent_recouvrement";

  const objetLabel = document.createElement("label");
  objetLabel.innerText = "Objet :";
  const objetInput = document.createElement("select");
  objetInput.name = "objet_recouvrement";
  const objetOptions = ["Etat de recouvrement", "Annulation titre"];
  objetOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    objetInput.appendChild(option);
  });

  const personneLabel = document.createElement("label");
  personneLabel.innerText = "Personne visée :";
  const personneInput = document.createElement("select");
  personneInput.name = "personne_visee";
  personneInput.id = "personne_visee";

  const periodeContainer = document.createElement("div");
  periodeContainer.classList.add("periode-container");

  const periodeLabel = document.createElement("label");
  periodeLabel.innerText = "Période :";
  const date1Input = document.createElement("input");
  date1Input.type = "date";
  date1Input.name = "date_debut";
  const date2Input = document.createElement("input");
  date2Input.type = "date";
  date2Input.name = "date_fin";
  const joursEntreLabel = document.createElement("label");
  joursEntreLabel.innerText = "Nombre de jours :";
  const joursEntreInput = document.createElement("input");
  joursEntreInput.type = "number";
  joursEntreInput.name = "jours_entre";
  joursEntreInput.disabled = true;

  date2Input.addEventListener("change", function () {
    const date1 = new Date(date1Input.value);
    const date2 = new Date(date2Input.value);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    joursEntreInput.value = diffDays;

    const montantJournalier = montantJournalierInput.value;
    const montantTotal = diffDays * montantJournalier;
    montantTotalInput.value = montantTotal;
  });

  periodeContainer.appendChild(periodeLabel);
  periodeContainer.appendChild(date1Input);
  periodeContainer.appendChild(date2Input);
  periodeContainer.appendChild(joursEntreLabel);
  periodeContainer.appendChild(joursEntreInput);

  const montantJournalierLabel = document.createElement("label");
  montantJournalierLabel.innerText = "Montant journalier :";
  const montantJournalierInput = document.createElement("input");
  montantJournalierInput.type = "number";
  montantJournalierInput.name = "montant_journalier";

  const montantTotalLabel = document.createElement("label");
  montantTotalLabel.innerText = "Montant total :";
  const montantTotalInput = document.createElement("input");
  montantTotalInput.type = "number";
  montantTotalInput.name = "montant_total";
  montantTotalInput.disabled = true;

  montantJournalierInput.addEventListener("change", function () {
    const jours = joursEntreInput.value;
    const montantJournalier = montantJournalierInput.value;
    const montantTotal = jours * montantJournalier;
    montantTotalInput.value = montantTotal;
  });

  const fondementLabel = document.createElement("label");
  fondementLabel.innerText = "Fondement de l'annulation :";
  const fondementInput = document.createElement("textarea");
  fondementInput.name = "fondement_annulation";

  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_recouvrement";

  formContainer.appendChild(titre_recouvrement);
  formContainer.appendChild(dateLabel);
  formContainer.appendChild(dateInput);
  formContainer.appendChild(agentLabel);
  formContainer.appendChild(agentInput);
  formContainer.appendChild(objetLabel);
  formContainer.appendChild(objetInput);
  formContainer.appendChild(personneLabel);
  formContainer.appendChild(personneInput);
  formContainer.appendChild(periodeContainer);
  formContainer.appendChild(montantJournalierLabel);
  formContainer.appendChild(montantJournalierInput);
  formContainer.appendChild(montantTotalLabel);
  formContainer.appendChild(montantTotalInput);
  formContainer.appendChild(fondementLabel);
  formContainer.appendChild(fondementInput);
  formContainer.appendChild(observationsLabel);
  formContainer.appendChild(observationsInput);

  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.addEventListener("click", creationRecouvrement);

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
        modalContainer.classList.add("recouvrement-popup-cont");
      }
    },
  });

  fetch("../pages/script/agent/script_agents.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const agentOptions = data.agents;
      agentOptions.forEach((agent) => {
        const option = document.createElement("option");
        option.value = agent.id; // Utiliser l'ID de l'agent
        option.text = `${agent.agent_nom} ${agent.agent_prenom}`.trim();
        agentInput.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des agents :", error);
    });

  fetch(
    `../pages/script/contrevenant/script_details_contrevenant.php?id=${dossierId}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const contrevenantOptions = data.contrevenants;
      contrevenantOptions.forEach((contrevenant) => {
        const option = document.createElement("option");
        option.value = contrevenant.id_contrevenant; // Utiliser l'ID du contrevenant
        option.text = `${contrevenant.nom} ${contrevenant.prenom}`.trim();
        personneInput.appendChild(option);
      });
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des contrevenants :",
        error
      );
    });

  function creationRecouvrement() {
    const formData = new FormData();
    formData.append("dossier_id", dossierId);
    formData.append("date_recouvrement", dateInput.value);
    formData.append("agent_recouvrement", agentInput.value);
    formData.append("objet_recouvrement", objetInput.value);
    formData.append("personne_visee", personneInput.value);
    formData.append("date_debut", date1Input.value);
    formData.append("date_fin", date2Input.value);
    formData.append("montant_journalier", montantJournalierInput.value);
    formData.append("montant_total", montantTotalInput.value);
    formData.append("fondement_annulation", fondementInput.value);
    formData.append("observations_recouvrement", observationsInput.value);

    const formDataObject = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });
    console.log("FormData values:", formDataObject);

    fetch("../pages/script/recouvrement/script_creation_recouvrement.php", {
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
        console.log("Recouvrement créé avec succès :", data);
        Swal.close();
      })
      .catch((error) => {
        console.error("Erreur lors de la création du recouvrement :", error);
      });
  }
}

function loadRecouvrements(idDossier) {
  fetch(
    `../pages/script/recouvrement/script_details_recouvrement.php?id_dossier=${idDossier}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      const tableRecouvrementsBody = document.querySelector(
        "#table-recouvrements tbody"
      );

      tableRecouvrementsBody.innerHTML = "";

      if (
        data.status === "success" &&
        data.recouvrements &&
        data.recouvrements.length > 0
      ) {
        data.recouvrements.forEach((recouvrement) => {
          const newRow = tableRecouvrementsBody.insertRow();

          const dateCell = newRow.insertCell(0);
          dateCell.innerText = recouvrement.recouvrement_date;

          const agentCell = newRow.insertCell(1);
          agentCell.innerText = recouvrement.recouvrement_agent;

          const objetCell = newRow.insertCell(2);
          objetCell.innerText = recouvrement.recouvrement_objet;

          const personneCell = newRow.insertCell(3);
          personneCell.innerText = recouvrement.recouvrement_contrevenant;

          const periodeCell = newRow.insertCell(4);
          periodeCell.innerText =
            recouvrement.recouvrement_date_periode_debut +
            " - " +
            recouvrement.recouvrement_date_periode_fin;

          const montantCell = newRow.insertCell(5);
          montantCell.innerText = recouvrement.recouvrement_montant_total;

          const actionCell = newRow.insertCell(6);
          actionCell.classList.add("bouton-tab-cont-requete");

          const modifyButton = document.createElement("button");
          modifyButton.classList.add("bouton-modification-requete");
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            showRecouvrementPopupPourModif(recouvrement);
          });
          actionCell.appendChild(modifyButton);

          const deleteButton = document.createElement("button");
          deleteButton.classList.add("bouton-suppression-requete");
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer ce recouvrement?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteRecouvrement(recouvrement.id);
              }
            });
          });
          actionCell.appendChild(deleteButton);
        });
      } else {
        const noDataMessage = document.createElement("tr");
        noDataMessage.innerHTML =
          '<td colspan="7">Aucun recouvrement trouvé.</td>';
        tableRecouvrementsBody.appendChild(noDataMessage);
      }
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des recouvrements :", error);
    });
}

function deleteRecouvrement(recouvrementId) {
  fetch(
    `../pages/script/recouvrement/script_delete_recouvrement.php?id=${recouvrementId}`,
    {
      method: "POST",
    }
  )
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
      console.error("Erreur lors de la suppression du recouvrement :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text:
          "Erreur lors de la suppression du recouvrement : " + error.message,
      });
    });
}
