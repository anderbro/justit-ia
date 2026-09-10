document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");
  // Référence au bouton
  const btnAjouterParquet = document.getElementById("btnAjouterParquet");

  // Vérifie que l'élément existe
  if (btnAjouterParquet) {
    // Ajoute l'écouteur d'événement
    btnAjouterParquet.addEventListener("click", function () {
      // Logique à exécuter lorsque le bouton est cliqué
      console.log("Bouton 'Créer une entrée au Parquet' cliqué !");
      const modifFlag = false;

      // Vous pouvez ajouter ici la logique que vous souhaitez exécuter
      // Par exemple, ouvrir un formulaire, afficher une popup, etc.
      showPopupFormParquet(modifFlag, null, null); // Assurez-vous que cette fonction existe et est définie
    });
  } else {
    console.error("Le bouton 'btnAjouterParquet' n'a pas été trouvé.");
  }

  fetch(
    `../pages/script/parquet/script_details_soit_trans_avis.php?id=${dossierId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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
      console.log("Données reçues :", data);

      const tableParquet = document.getElementById("tableParquet");
      const tbody = tableParquet.querySelector("tbody");

      // Clear existing table rows
      tbody.innerHTML = "";
      console.log("résultats de la requete : ", data.soitTransmis);
      // Process soitTransmis data
      if (Array.isArray(data.soitTransmis)) {
        console.log("Données soitTransmis :", data.soitTransmis);
        data.soitTransmis.forEach((soitTransmis) => {
          const newRow = tbody.insertRow();

          const dateCell = newRow.insertCell(0);
          const auteurCell = newRow.insertCell(1);
          const typeCell = newRow.insertCell(2);
          const numeroCell = newRow.insertCell(3);
          const objetCell = newRow.insertCell(4);
          const actionCell = newRow.insertCell(5);

          actionCell.classList.add("bouton-tab-cont-infraction");

          const modifyButton = document.createElement("button");
          modifyButton.classList.add("bouton-modification-contrevenant");
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            const modification = true;
            const type = "soit_transmis";
            const id = soitTransmis.id_soit_transmis;
            showPopupFormParquet(modification, type, id);
          });
          actionCell.appendChild(modifyButton);

          const deleteButton = document.createElement("button");
          deleteButton.classList.add("bouton-suppression-contrevenant");
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            console.log(
              "id transmis à delete : ",
              soitTransmis.id_soit_transmis
            );

            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer cet élément?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteSoitTransmis(soitTransmis.id_soit_transmis, dossierId);
              }
            });
          });
          actionCell.appendChild(deleteButton);

          dateCell.innerHTML =
            soitTransmis.soit_trans_date_premiere_audition || "";
          auteurCell.innerHTML = soitTransmis.parquet || "";
          typeCell.innerHTML = "Soit transmis";
          numeroCell.innerHTML = soitTransmis.soit_trans_numero || "";
          objetCell.innerHTML = soitTransmis.soit_trans_damande_parquet || "";
        });
      } else {
        console.error("Les données soitTransmis ne sont pas un tableau.");
      }

      // Process avis data
      if (Array.isArray(data.avis)) {
        console.log("Données avis :", data.avis);
        data.avis.forEach((avis) => {
          const newRow = tbody.insertRow();

          const dateCell = newRow.insertCell(0);
          const auteurCell = newRow.insertCell(1);
          const typeCell = newRow.insertCell(2);
          const numeroCell = newRow.insertCell(3);
          const objetCell = newRow.insertCell(4);
          const actionCell = newRow.insertCell(5);

          actionCell.classList.add("bouton-tab-cont-infraction");

          const modifyButton = document.createElement("button");
          modifyButton.classList.add("bouton-modification-contrevenant");
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            const modification = true;
            const type = "avis";
            const id = avis.id_avis;
            console.log("id_avis envoyé pour l'affichage u form : ", id);
            showPopupFormParquet(modification, type, id);
          });
          actionCell.appendChild(modifyButton);

          const deleteButton = document.createElement("button");
          deleteButton.classList.add("bouton-suppression-contrevenant");
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            console.log("id transmis à delete : ", avis.id_avis);

            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer cet élément?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                deleteAvis(avis.id_avis, dossierId);
              }
            });
          });
          actionCell.appendChild(deleteButton);

          dateCell.innerHTML = avis.avis_date || "";
          auteurCell.innerHTML = avis.parquet || "";
          typeCell.innerHTML = "Avis";
          numeroCell.innerHTML = avis.soit_trans_numero || "";
          objetCell.innerHTML = avis.avis_observations || "";
        });
      } else {
        console.error("Les données avis ne sont pas un tableau.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la récupération des données.",
      });
    });
});

function showPopupFormParquet(modifFlag, defaultType, id) {
  console.log("defaultType :", defaultType);
  console.log("modiflag : ", modifFlag);
  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "parquet-form");

  const titre = document.createElement("labelForm");
  titre.innerText = "Parquet";
  formContainer.appendChild(titre);

  const typeLabel = document.createElement("label");
  typeLabel.innerText = "Type :";
  const typeInput = document.createElement("select");
  typeInput.name = "parquet_type";
  typeInput.id = "parquet_type";

  const typeOptions = ["Avis", "Soit transmis"];

  typeOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText.toLowerCase().replace(" ", "_");
    option.text = optionText;
    typeInput.appendChild(option);
  });

  typeInput.addEventListener("change", function () {
    const avisForm = document.getElementById("avis_form");
    const avisDataForm = document.getElementById("soit_transmis_form");
    avisForm.style.display = "none";
    avisDataForm.style.display = "none";

    if (typeInput.value === "avis") {
      avisForm.style.display = "block";
    } else if (typeInput.value === "soit_transmis") {
      avisDataForm.style.display = "block";
    }
  });

  if (!modifFlag) {
    formContainer.appendChild(typeLabel);
    formContainer.appendChild(typeInput);
  }

  const defaultTypeToUse =
    defaultType && defaultType.toLowerCase() === "soit_transmis"
      ? "Soit_transmis"
      : "Avis";

  const avisForm = createAvisForm(modifFlag, id);
  const avisDataForm = createavisDataForm(modifFlag, id);

  if (defaultTypeToUse === "Soit_transmis") {
    avisForm.style.display = "none";
    avisDataForm.style.display = "block";
  } else {
    avisForm.style.display = "block";
    avisDataForm.style.display = "none";
  }

  formContainer.appendChild(avisForm);
  formContainer.appendChild(avisDataForm);

  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.addEventListener("click", function () {
    console.log("Clique soumettre !!!!");
    if (modifFlag === false) {
      if (typeInput.value === "avis") {
        submitAvisForm(formContainer);
      } else if (typeInput.value === "soit_transmis") {
        submitavisDataForm(formContainer);
      }
    } else if (modifFlag === true) {
      if (defaultType === "avis") {
        submitModifAvisForm(formContainer, id);
      } else if (defaultType === "soit_transmis") {
        submitModifAvisDataForm(formContainer, id);
      }
    }
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
        modalContainer.classList.add("parquet-popup-cont");
      }
    },
  });
}

function submitAvisForm(formContainer) {
  const formData = new FormData();
  const dossierId = urlParams.get("id");

  let iterationCount = 0;

  formContainer.querySelectorAll("input, select, textarea").forEach((input) => {
    if (iterationCount < 6) {
      formData.append(input.name, input.value);
      iterationCount++;
    }
  });

  // Afficher le contenu de formData dans la console
  console.log("Contenu de formData : ");
  for (const pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  const endpoint = "../pages/script/parquet/script_creation_parquet_avis.php";

  fetch(endpoint, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Le formulaire a été soumis avec succès !",
        }).then(() => {
          // Actualiser la liste des contrevenants après l'ajout ou la modification
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text:
            data.error ||
            "Une erreur est survenue lors de la soumission du formulaire.",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text:
          "Une erreur est survenue lors de la soumission du formulaire : " +
          error.message,
      });
    });

  console.log("Soumettre le formulaire Avis");
}

function createAvisForm(modifFlag, id_avis) {
  const avisForm = document.createElement("div");
  avisForm.id = "avis_form";
  avisForm.style.display = "none";

  const auteurLabel = document.createElement("label");
  auteurLabel.innerText = "Auteur :";
  const auteurInput = document.createElement("select");
  auteurInput.name = "auteur_transmis";
  auteurInput.id = "auteur_transmis";

  // Récupérer les parquets et les agents depuis les scripts PHP
  Promise.all([
    fetch("../pages/script/script_data_parquet.php").then((response) =>
      response.json()
    ),
    fetch("../pages/script/agent/script_agents.php").then((response) =>
      response.json()
    ),
  ])
    .then(([parquets, agents]) => {
      // Ajouter les options des parquets
      parquets.forEach((parquet) => {
        const option = document.createElement("option");
        option.value = parquet.id_parquet; // Utilisez l'ID de parquet comme valeur
        option.text = parquet.parquet; // Utilisez le nom de parquet comme texte
        auteurInput.appendChild(option);
      });

      // Ajouter les options des agents
      if (agents && Array.isArray(agents.agents)) {
        agents.agents.forEach((agent) => {
          const option = document.createElement("option");
          option.value = `${agent.agent_nom} ${agent.agent_prenom}`.trim();
          option.text = `${agent.agent_nom} ${agent.agent_prenom}`.trim();
          auteurInput.appendChild(option);
        });
      } else {
        throw new Error("Erreur lors de la récupération des agents");
      }
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des auteurs transmis :",
        error
      );
    });

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_avis";
  dateInput.id = "date_avis";

  const numeroLabel = document.createElement("label");
  numeroLabel.innerText = "Numéro Soit Transmis :";
  const numeroInput = document.createElement("select");
  numeroInput.name = "numero_soit_transmis";
  numeroInput.id = "numero_soit_transmis";

  const dossierId = new URLSearchParams(window.location.search).get("id");

  // Récupérer les numéros de soit transmis depuis le script PHP
  fetch(
    `../pages/script/script_data_numero_soit_transmis.php?id_dossier=${dossierId}`
  )
    .then((response) => response.json())
    .then((data) => {
      // Remplir la liste déroulante avec les numéros de soit transmis récupérés
      console.log("Numéro Soit Transmis : ", data);
      data.forEach((avisData) => {
        const option = document.createElement("option");
        option.value = avisData.soit_trans_numero; // Utilisez le numéro de soit transmis comme valeur
        option.text = avisData.soit_trans_numero; // Utilisez le numéro de soit transmis comme texte
        numeroInput.appendChild(option);
      });
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des numéros de soit transmis :",
        error
      );
    });

  const conclusionLabel = document.createElement("label");
  conclusionLabel.innerText = "Conclusion de l'avis :";
  const conclusionInput = document.createElement("textarea");
  conclusionInput.name = "conclusion_avis";
  conclusionInput.id = "conclusion_avis";

  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations de l'avis :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_avis";
  observationsInput.id = "observations_avis";

  avisForm.appendChild(auteurLabel);
  avisForm.appendChild(auteurInput);
  avisForm.appendChild(dateLabel);
  avisForm.appendChild(dateInput);
  avisForm.appendChild(numeroLabel);
  avisForm.appendChild(numeroInput);
  avisForm.appendChild(conclusionLabel);
  avisForm.appendChild(conclusionInput);
  avisForm.appendChild(observationsLabel);
  avisForm.appendChild(observationsInput);

  console.log("Avis Form : ", avisForm);
  if (modifFlag) {
    fillFormFieldsAvisForm(avisForm, id_avis);
    console.log("id transmis à fillFormFieldsAvisForm : ", id_avis);
  }

  return avisForm;
}

function fillFormFieldsAvisForm(avisForm, id_avis) {
  console.log("Champs du formulaire avis :", avisForm);

  const id = id_avis;
  console.log(" id à remplir ::: ", id);

  fetch(
    `../pages/script/parquet/script_details_avis_pour_remplir.php?id=${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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
      console.log("Avis reçus :", data);

      if (data.avis) {
        const avisDetails = data.avis;
        const numSoitTransmis = data.soit_transmis;

        const formElements = avisForm.querySelectorAll(
          "input, textarea, select"
        );

        formElements.forEach((element) => {
          const fieldName = element.name;
          switch (fieldName) {
            case "auteur_transmis":
              const selectAuteurElement = element;
              selectAuteurElement.innerHTML = ""; // Vide le contenu actuel du select

              // Récupérer et ajouter les parquets et agents
              Promise.all([
                fetch(`../pages/script/script_data_parquet.php`).then(
                  (response) => response.json()
                ),
                fetch("../pages/script/agent/script_agents.php").then(
                  (response) => response.json()
                ),
              ])
                .then(([parquets, agents]) => {
                  // Ajouter les options des parquets
                  parquets.forEach((parquet) => {
                    const option = document.createElement("option");
                    option.value = parquet.parquet;
                    option.text = parquet.parquet;
                    selectAuteurElement.appendChild(option);

                    // Si l'option actuellement ajoutée correspond à celle récupérée de la première requête, la sélectionner
                    if (parquet.parquet === data.parquets[0]) {
                      option.selected = true;
                    }
                  });

                  // Ajouter les options des agents
                  if (agents && Array.isArray(agents.agents)) {
                    agents.agents.forEach((agent) => {
                      const option = document.createElement("option");
                      option.value =
                        `${agent.agent_nom} ${agent.agent_prenom}`.trim();
                      option.text =
                        `${agent.agent_nom} ${agent.agent_prenom}`.trim();
                      selectAuteurElement.appendChild(option);
                    });
                  } else {
                    throw new Error(
                      "Erreur lors de la récupération des agents"
                    );
                  }
                })
                .catch((error) => {
                  console.error(
                    "Erreur lors de la récupération des auteurs transmis :",
                    error
                  );
                });
              break;

            case "conclusion_avis":
              element.value = avisDetails[0].avis_conclusion || "";
              break;

            case "observations_avis":
              element.value = avisDetails[0].avis_observations || "";
              break;

            case "date_avis":
              element.value = avisDetails[0].avis_date || "";
              break;

            case "numero_soit_transmis":
              const selectNumeroElement = element;
              selectNumeroElement.innerHTML = ""; // Vide le contenu actuel du select

              // Ajoute les autres options depuis le script PHP
              const dossierId = new URLSearchParams(window.location.search).get(
                "id"
              );
              fetch(
                `../pages/script/script_data_numero_soit_transmis.php?id_dossier=${dossierId}`
              )
                .then((response) => response.json())
                .then((numeros) => {
                  // Remplir la liste déroulante avec les numéros de soit transmis récupérés
                  numeros.forEach((numero) => {
                    const option = document.createElement("option");
                    option.value = numero.soit_trans_numero; // Utilisez le numéro de soit transmis comme valeur
                    option.text = numero.soit_trans_numero; // Utilisez le numéro de soit transmis comme texte
                    selectNumeroElement.appendChild(option);

                    // Si l'option actuellement ajoutée correspond à celle récupérée de la première requête, la sélectionner
                    if (
                      numero.soit_trans_numero ===
                      numSoitTransmis[0]["soit_trans_numero"]
                    ) {
                      option.selected = true;
                    }
                  });
                })
                .catch((error) => {
                  console.error(
                    "Erreur lors de la récupération des numéros de soit transmis :",
                    error
                  );
                });
              break;

            default:
              break;
          }
        });

        if (numSoitTransmis) {
          console.log("Numéro de soit transmis :", numSoitTransmis);
        }
      } else {
        console.error("Aucun avis trouvé pour l'ID fourni.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des avis:", error);
    });
}

function createavisDataForm(modifFlag, id_soit_transmis) {
  //console.log("modiflag dans CREATEAVISDATAFORM : ", modifFlag);
  const avisDataForm = document.createElement("div");
  avisDataForm.id = "soit_transmis_form";
  avisDataForm.style.display = "none";

  const auteurLabel = document.createElement("label");
  auteurLabel.innerText = "Auteur :";
  const auteurInput = document.createElement("select");
  auteurInput.name = "auteur_transmis";
  auteurInput.id = "auteur_transmis";

  // Récupérer les auteurs (parquets et agents) depuis les scripts PHP
  Promise.all([
    fetch("../pages/script/script_data_parquet.php").then((response) =>
      response.json()
    ),
    fetch("../pages/script/agent/script_agents.php").then((response) =>
      response.json()
    ),
  ])
    .then(([parquets, agents]) => {
      // Ajouter les options des parquets
      parquets.forEach((parquet) => {
        const option = document.createElement("option");
        option.value = parquet.id_parquet; // Utilisez l'ID de parquet comme valeur
        option.text = parquet.parquet; // Utilisez le nom de parquet comme texte
        auteurInput.appendChild(option);
      });

      // Ajouter les options des agents
      if (agents && Array.isArray(agents.agents)) {
        agents.agents.forEach((agent) => {
          const option = document.createElement("option");
          option.value = `${agent.agent_nom} ${agent.agent_prenom}`.trim();
          option.text = `${agent.agent_nom} ${agent.agent_prenom}`.trim();
          auteurInput.appendChild(option);
        });
      } else {
        throw new Error("Erreur lors de la récupération des agents");
      }
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des auteurs transmis :",
        error
      );
    });

  const dateLabel = document.createElement("label");
  dateLabel.innerText = "Date :";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "date_transmis";
  dateInput.id = "date_transmis";

  const numeroLabel = document.createElement("label");
  numeroLabel.innerText = "Numéro Soit Transmis :";
  const numeroInput = document.createElement("input");
  numeroInput.type = "text";
  numeroInput.name = "numero_soit_transmis";
  numeroInput.id = "numero_soit_transmis";

  const demandeLabel = document.createElement("label");
  demandeLabel.innerText = "Demande du parquet :";
  const demandeInput = document.createElement("textarea");
  demandeInput.name = "demande_parquet";
  demandeInput.id = "demande_parquet";

  const dateAuditionLabel = document.createElement("label");
  dateAuditionLabel.innerText = "Date de première audition :";
  const dateAuditionInput = document.createElement("input");
  dateAuditionInput.type = "date";
  dateAuditionInput.name = "date_premiere_audition";
  dateAuditionInput.id = "date_premiere_audition";

  const dateLimiteLabel = document.createElement("label");
  dateLimiteLabel.innerText = "Date limite d'enquête :";
  const dateLimiteInput = document.createElement("input");
  dateLimiteInput.type = "date";
  dateLimiteInput.name = "date_limite_enquete";
  dateLimiteInput.id = "date_limite_enquete";

  // Ajouter un écouteur d'événement pour remplir automatiquement "date_limite_enquete"
  dateAuditionInput.addEventListener("change", () => {
    const dateAuditionValue = new Date(dateAuditionInput.value);
    if (!isNaN(dateAuditionValue)) {
      dateAuditionValue.setFullYear(dateAuditionValue.getFullYear() + 2);
      const year = dateAuditionValue.getFullYear();
      const month = String(dateAuditionValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateAuditionValue.getDate()).padStart(2, "0");
      dateLimiteInput.value = `${year}-${month}-${day}`;
    } else {
      dateLimiteInput.value = "";
    }
  });

  const prioriteLabel = document.createElement("label");
  prioriteLabel.innerText = "Priorité :";
  const prioriteInput = document.createElement("select");
  prioriteInput.name = "priorite";
  prioriteInput.id = "priorite";
  const prioriteOptions = ["P1", "P2", "P3"];
  prioriteOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.text = optionText;
    prioriteInput.appendChild(option);
  });

  const traiteLabel = document.createElement("label");
  traiteLabel.innerText = "Traitée :";
  const traiteInput = document.createElement("input");
  traiteInput.type = "checkbox";
  traiteInput.name = "traite";
  traiteInput.id = "traite";

  const observationsLabel = document.createElement("label");
  observationsLabel.innerText = "Observations :";
  const observationsInput = document.createElement("textarea");
  observationsInput.name = "observations_transmis";
  observationsInput.id = "observations_transmis";

  avisDataForm.appendChild(auteurLabel);
  avisDataForm.appendChild(auteurInput);
  avisDataForm.appendChild(dateLabel);
  avisDataForm.appendChild(dateInput);
  avisDataForm.appendChild(numeroLabel);
  avisDataForm.appendChild(numeroInput);
  avisDataForm.appendChild(demandeLabel);
  avisDataForm.appendChild(demandeInput);
  avisDataForm.appendChild(dateAuditionLabel);
  avisDataForm.appendChild(dateAuditionInput);
  avisDataForm.appendChild(dateLimiteLabel);
  avisDataForm.appendChild(dateLimiteInput);
  avisDataForm.appendChild(prioriteLabel);
  avisDataForm.appendChild(prioriteInput);
  avisDataForm.appendChild(traiteLabel);
  avisDataForm.appendChild(traiteInput);
  avisDataForm.appendChild(observationsLabel);
  avisDataForm.appendChild(observationsInput);

  if (modifFlag) {
    fillFromFieldsAvisDataForm(avisDataForm, id_soit_transmis);
  }

  return avisDataForm;
}
async function fillFromFieldsAvisDataForm(avisDataForm, idSoitTransmis) {
  console.log("Champs de avis data form avant query : ", avisDataForm);
  console.log(
    "Champs de avis data form : ",
    avisDataForm.querySelectorAll("*")
  );
  try {
    console.log(
      "Remplir les champs du formulaire avec l'ID soit_transmis:",
      idSoitTransmis
    );

    const urlSoitTransmis = `../pages/script/parquet/script_soit_transmis_pour_remplir.php?id=${idSoitTransmis}`;

    // Première requête pour obtenir les données du soit transmis
    const responseSoitTransmis = await fetch(urlSoitTransmis, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!responseSoitTransmis.ok) {
      throw new Error(
        `La réponse du réseau n'était pas ok: ${responseSoitTransmis.statusText}`
      );
    }

    const dataSoitTransmis = await responseSoitTransmis.json();

    if (dataSoitTransmis.error) {
      console.error("Erreur:", dataSoitTransmis.error);
      return;
    }

    //console.log('Succès:', dataSoitTransmis.soitTransmisData);
    //console.log('id parquet:', dataSoitTransmis.soitTransmisData['id_parquet']);

    const formFields = {
      date_transmis: "soit_trans_date", // Si la date de transmission est incluse dans les données
      numero_soit_transmis: "soit_trans_numero",
      demande_parquet: "soit_trans_damande_parquet",
      date_premiere_audition: "soit_trans_date_premiere_audition",
      date_limite_enquete: "soit_trans_date_limite_enquete",
      priorite: "soit_trans_priorite",
      traite: "soit_trans_traite",
      observations_transmis: "soit_trans_observation",
    };

    //console.log('formFields pour le remplissage:', formFields);

    for (const [fieldName, jsonDataKey] of Object.entries(formFields)) {
      const field = avisDataForm.querySelector(`[name=${fieldName}]`);
      const fieldValue = dataSoitTransmis.soitTransmisData[jsonDataKey];
      if (field && fieldValue !== undefined) {
        if (field.type === "checkbox") {
          field.checked = fieldValue === "1";
        } else {
          field.value = fieldValue;
        }
      }
    }

    //console.log("Id de soit_transmis dans le formulaire:", idSoitTransmis);

    const idDuParquet = dataSoitTransmis.soitTransmisData["id_parquet"];
    //console.log('id du parquet dans la deuxieme requete:', idDuParquet);

    // Deuxième requête pour obtenir le nom du parquet
    const urlNomParquet = `../pages/script/parquet/script_nom_parquet.php?id=${idDuParquet}`;

    const responseNomParquet = await fetch(urlNomParquet, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!responseNomParquet.ok) {
      throw new Error(
        `La réponse du réseau n'était pas ok: ${responseNomParquet.statusText}`
      );
    }

    const dataNomParquet = await responseNomParquet.json();

    if (dataNomParquet.error) {
      console.error("Erreur:", dataNomParquet.error);
    } else {
      //console.log("Nom de parquet extrait:", dataNomParquet.parquet);
      const selectAuteur = avisDataForm.querySelector("select#auteur_transmis");
      //console.log("Select Auteur : ", selectAuteur);

      if (selectAuteur) {
        let optionFound = false;
        for (const option of selectAuteur.options) {
          if (option.innerText === dataNomParquet.parquet) {
            selectAuteur.value = option.value;
            optionFound = true;
            break;
          }
        }
        if (!optionFound) {
          console.warn(
            `L'option avec le texte "${dataNomParquet.parquet}" n'a pas été trouvée.`
          );
        }
      }
    }
  } catch (error) {
    console.error("Erreur de fetch:", error);
  }
}
function submitavisDataForm(formContainer) {
  const formData = new FormData();
  const dossierId = urlParams.get("id");

  formContainer.querySelectorAll("input, select, textarea").forEach((input) => {
    if (input.type === "checkbox") {
      //console.log("valeur de checkbox :", input.checked);
      if (input.checked) {
        formData.append(input.name, 1);
      } else {
        formData.append(input.name, 0);
      }
    } else {
      formData.append(input.name, input.value);
    }
  });

  // ajout ID de dossier qui correspond à la page
  formData.append("id_dossier", dossierId);
  // ajout de parquet transmis
  //console.log(' communes transmis dans form Data',formData['auteur_transmis']);

  // Retour console pour voir comment se remplit le FormData
  for (const pair of formData.entries()) {
    //console.log(pair[0] + ': ' + pair[1]);
  }

  const endpoint = "../pages/script/parquet/script_creation_parquet.php";

  fetch(endpoint, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Le formulaire a été soumis avec succès !",
        }).then(() => {
          // Actualiser la liste des contrevenants après l'ajout ou la modification
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text:
            data.error ||
            "Une erreur est survenue lors de la soumission du formulaire.",
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text:
          "Une erreur est survenue lors de la soumission du formulaire : " +
          error.message,
      });
    });
}
function requetId_Parquet(nom_parquet) {
  console.log(
    " nom parquet dans request idParquet : ",
    nom_parquet.get("auteur_transmis")
  );
  formData_idParquet = new FormData();
  formData_idParquet.append("nomParquet", nom_parquet.get("auteur_transmis"));

  const endpoint = "../pages/script/parquet/script_Id_parquet.php";

  fetch(endpoint, {
    method: "POST",
    body: formData_idParquet,
  })
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
        icon: "success",
        title: "Succès",
        text: "Le formulaire a été soumis avec succès !",
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de la soumission du formulaire.",
      });
    });
  return response;
  console.log("data extraite de la requete parquet : ", response);
}

function submitModifAvisDataForm(formContainer, id_soit_transmis) {
  console.log(
    "Form container transmise dans submitModifAvisDataForm",
    formContainer
  );
  const formData = new FormData();
  const elements = formContainer.querySelectorAll("input, select, textarea");
  console.log("éléments du FormContainer : ", elements);
  console.log("id soit transmis : ", id_soit_transmis);

  // Variable pour suivre le premier 'auteur_transmis'
  let foundFirstAuteurTransmis = false;

  elements.forEach((element) => {
    if (element.name === "auteur_transmis") {
      // Si c'est le premier 'auteur_transmis', le marque comme trouvé et passe
      if (!foundFirstAuteurTransmis) {
        foundFirstAuteurTransmis = true;
        return; // Ignore le premier 'auteur_transmis'
      }
    }

    // Ajouter les autres éléments au formData
    if (element.type === "checkbox") {
      formData.append(element.name, element.checked);
    } else {
      formData.append(element.name, element.value);
    }
  });

  // Ajouter l'id_soit_transmis au formData
  formData.append("id_soit_transmis", id_soit_transmis);

  console.log("Avis Data Form Data:");
  formData.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  // Soumettre formData via AJAX ou fetch
  fetch(`../pages/script/parquet/script_modif_soit_transmis.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse du serveur pour la modification :", data);

      // Traiter la réponse du serveur ici
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Soit_transmis modifié avec succès.",
        }).then(() => {
          // Actualiser la liste des contrevenants après la modification
          location.reload();
        });
      } else {
        // Traitement des erreurs :
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la modification du contrevenant.",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur s'est produite lors de la communication avec le serveur.",
      });
    });
}

function submitModifAvisForm(formContainer, id_avis) {
  console.log("Form container transmise dans submitModifAvis", formContainer);
  const formData = new FormData();
  const elements = formContainer.querySelectorAll("input, select, textarea");
  console.log("éléments du FormContainer : ", elements);
  console.log("id du l'avis : ", id_avis);
  let count = 0; // Variable pour compter les éléments ajoutés

  elements.forEach((element) => {
    if (count >= 5) {
      return; // Sortir de la boucle si 5 éléments ont été ajoutés
    }

    if (element.name === "auteur_transmis") {
      // Si c'est le premier 'auteur_transmis', passer au suivant
      if (count === 4) {
        count++;
        return;
      }
    }

    if (element.type === "checkbox") {
      formData.append(element.name, element.checked);
    } else {
      formData.append(element.name, element.value);
    }

    count++;
  });

  // Ajouter l'id_soit_transmis au formData
  formData.append("id_avis", id_avis);

  console.log("Avis Data Form Data:");
  formData.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });
  console.log("------------------");

  // Soumettre formData via AJAX ou fetch
  fetch(`../pages/script/parquet/script_modif_avis.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Réponse du serveur pour la modification :", data);

      // Traiter la réponse du serveur ici
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Soit_transmis modifié avec succès.",
        }).then(() => {
          // Actualiser la liste des contrevenants après la modification
          location.reload();
        });
      } else {
        // Traitement des erreurs :
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la modification du contrevenant.",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur s'est produite lors de la communication avec le serveur.",
      });
    });
}
function deleteSoitTransmis(id, dossierId) {
  // Gérer la suppression du contrevenant ici
  console.log("Suppression du soit_transmis avec l'ID :", id);

  // Faire une requête AJAX pour supprimer le contrevenant
  fetch(
    `../pages/script/parquet/script_suppression_SoitTransmis.php?id=${id}&dossierId=${dossierId}`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Réponse du serveur :", data);

      // Traiter la réponse du serveur ici
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "soit_transmis supprimé avec succès.",
          confirmButtonText: "OK",
        }).then(() => {
          // Actualiser la liste des contrevenants après l'ajout ou la modification
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la suppression du soit_transmis.",
          confirmButtonText: "OK",
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la suppression du soit_transmis.",
        confirmButtonText: "OK",
      });
    });
}

function deleteAvis(id, dossierId) {
  // Gérer la suppression du contrevenant ici
  console.log("Suppression de l'avis avec l'ID :", id);

  // Faire une requête AJAX pour supprimer le contrevenant
  fetch(
    `../pages/script/parquet/script_suppression_Avis.php?id=${id}&dossierId=${dossierId}`,
    {
      method: "GET",
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Réponse du serveur :", data);

      // Traiter la réponse du serveur ici
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Avis supprimé avec succès.",
          confirmButtonText: "OK",
        }).then(() => {
          // Actualiser la liste des contrevenants après l'ajout ou la modification
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la suppression de l'avis.",
          confirmButtonText: "OK",
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la suppression de l'avis.",
        confirmButtonText: "OK",
      });
    });
}
