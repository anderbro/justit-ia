// Tableau pour stocker les valeurs des champs natinf
let natinfValues = [];
document.addEventListener("DOMContentLoaded", function () {
  const tableInfractions = document.getElementById("tableInfractions");

  // Ajouter un écouteur d'événement pour le bouton "Ajouter Infraction"
  const btnAjouterInfraction = document.getElementById("btnAjouterInfraction");
  btnAjouterInfraction.addEventListener("click", function () {
    // Appeler la fonction pour afficher la popup de formulaire d'infraction
    showPopupFormInfraction();
  });

  // // Ajouter un écouteur d'événement pour le bouton "Chercher Infraction"
  // const btnChercherInfraction = document.getElementById(
  //   "btnChercherInfraction"
  // );
  // btnChercherInfraction.addEventListener("click", function () {
  //   // Appeler une fonction pour gérer la recherche d'infractions
  //   showSearchPopupInfraction();
  // });

  fetch(
    `../pages/script/infraction/script_details_infractions.php?id=${dossierId}`,
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
      console.log("Infractions reçues :", data);

      // Effacer le contenu existant du tableau
      tableInfractions.querySelector("tbody").innerHTML = "";

      if (tableInfractions && data.infractions && data.infractions.length > 0) {
        data.infractions.forEach((infraction) => {
          // Ajouter une nouvelle ligne au tableau
          const newRow = tableInfractions.querySelector("tbody").insertRow();

          // Ajouter des cellules à la ligne
          const dateCell = newRow.insertCell(0);
          const referenceCell = newRow.insertCell(1);
          const entiteCell = newRow.insertCell(2);
          const natinfCell = newRow.insertCell(3); // Nouvelle cellule pour afficher les natinfs
          const actionCell = newRow.insertCell(4);
          actionCell.classList = "bouton-tab-cont-infraction";

          // Remplir les cellules avec les données de l'infraction
          dateCell.innerHTML = infraction.pv_date;
          referenceCell.innerHTML = infraction.pv_reference;
          entiteCell.innerHTML = infraction.pv_correspondant;
          natinfCell.innerHTML = infraction.natinf_nums; // Remplacer par les numéros de natinfs

          // Ajouter le bouton "Modifier"
          const modifyButton = document.createElement("button");
          modifyButton.classList = "bouton-modification-infraction";
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            // Appeler une fonction pour afficher la pop-up de modification d'infraction
            showInfractionPopup(infraction);
            console.log(infraction);
          });
          actionCell.appendChild(modifyButton);

          // Ajouter le bouton "Supprimer"
          const deleteButton = document.createElement("button");
          deleteButton.classList = "bouton-suppression-infraction";
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            // Ajouter une confirmation avant la suppression
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer cette infraction?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                // Appeler une fonction pour gérer la suppression
                deleteInfraction(infraction.id_pv, dossierId);
              }
            });
          });
          actionCell.appendChild(deleteButton);
        });
      }
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la requête AJAX pour les infractions : ",
        error
      );
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la récupération des infractions.",
      });
    });
});

// Fonction pour récupérer la liste des natinf
function fetchNatinfList() {
  return fetch("../pages/script/natinf/script_lecture_natinf.php") // Assurez-vous de spécifier le bon chemin vers votre script
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const natinfSelect = document.getElementById("pv_natinf");
      if (natinfSelect) {
        natinfSelect.innerHTML = "";
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.text = "Sélectionnez une natinf";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        natinfSelect.appendChild(defaultOption);

        data.forEach((natinf) => {
          const option = document.createElement("option");
          option.value = natinf.id_natinf;
          option.text = natinf.Num;
          natinfSelect.appendChild(option);
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des natinf :", error);
    });
}

function createNatinfGroup(formContainer, initialCodes) {
  const group = document.createElement("div");
  group.className = "natinf-group";

  const header = document.createElement("div");
  header.className = "natinf-group__header";

  const label = document.createElement("span");
  label.className = "natinf-group__label";
  label.textContent = "Codes NATINF";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "natinf-add";
  addButton.textContent = "Ajouter un code";

  header.appendChild(label);
  header.appendChild(addButton);

  const list = document.createElement("div");
  list.className = "natinf-group__list";
  group.appendChild(header);
  group.appendChild(list);

  function updateNatinfOptions() {
    const selectedValues = Array.from(formContainer.querySelectorAll("select[name='pv_natinf']"))
      .map(function (select) { return select.value; })
      .filter(Boolean);

    formContainer.querySelectorAll("select[name='pv_natinf']").forEach(function (select) {
      Array.from(select.options).forEach(function (option) {
        option.disabled = selectedValues.indexOf(option.value) !== -1 && option.value !== select.value;
      });
    });
  }

  function addNatinfField(code) {
    const row = document.createElement("div");
    row.className = "natinf-container";

    const select = document.createElement("select");
    select.name = "pv_natinf";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choisir un code";
    select.appendChild(placeholder);

    fetch("../pages/script/natinf/script_lecture_natinf.php")
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data || data.error) {
          return;
        }
        var selectedId = "";
        data.forEach(function (natinf) {
          const option = document.createElement("option");
          option.value = natinf.id_natinf;
          option.textContent = natinf.Num;
          select.appendChild(option);
          if (code && String(code).trim() === String(natinf.Num).trim()) {
            selectedId = String(natinf.id_natinf);
          }
        });
        if (selectedId) {
          select.value = selectedId;
        } else if (code) {
          select.value = String(code).trim();
        }
        updateNatinfOptions();
      })
      .catch(function (error) {
        console.error("Erreur lors de la récupération des NATINF :", error);
      });

    select.addEventListener("change", updateNatinfOptions);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "natinf-remove";
    removeButton.setAttribute("aria-label", "Retirer ce code");
    removeButton.textContent = "×";
    removeButton.addEventListener("click", function () {
      row.remove();
      if (!list.querySelector(".natinf-container")) {
        addNatinfField();
      }
      updateNatinfOptions();
    });

    row.appendChild(select);
    row.appendChild(removeButton);
    list.appendChild(row);
  }

  addButton.addEventListener("click", function (event) {
    event.preventDefault();
    addNatinfField();
  });

  const codes = (initialCodes || []).map(function (code) { return String(code).trim(); }).filter(Boolean);
  if (codes.length) {
    codes.forEach(addNatinfField);
  } else {
    addNatinfField();
  }

  return group;
}

function showPopupFormInfraction() {

  // Créer les éléments HTML du formulaire d'infraction
  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "infraction-form");

  const titre = document.createElement("label");
  titre.innerText = "Infraction";
  formContainer.appendChild(titre);

  // Ajout de la liste déroulante pour le type
  const typeLabel = document.createElement("label");
  typeLabel.innerHTML = "Type :";
  const typeInput = document.createElement("select");
  typeInput.name = "pv_type";
  typeInput.id = "pv_type";
  const typeOptions = ["AIT", "Signalement", "PV"];
  typeOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.text = optionText;
    typeInput.appendChild(option);
  });

  formContainer.appendChild(typeLabel);
  formContainer.appendChild(typeInput);
  formContainer.appendChild(createNatinfGroup(formContainer));

  // Ajout de la liste déroulante pour la commune
  const communeLabel = document.createElement("label");
  communeLabel.innerHTML = "Commune :";
  const communeSelect = document.createElement("select");
  communeSelect.name = "pv_commune";
  communeSelect.id = "pv_commune";

  const defaultOptionCommune = document.createElement("option");
  defaultOptionCommune.value = "";
  defaultOptionCommune.text = "Sélectionnez une commune";
  defaultOptionCommune.disabled = true;
  defaultOptionCommune.selected = true;
  communeSelect.appendChild(defaultOptionCommune);

  formContainer.appendChild(communeLabel);
  formContainer.appendChild(communeSelect);

  // Champ d'arrondissement
  const arrondissementLabel = document.createElement("label");
  arrondissementLabel.innerHTML = "Arrondissement :";
  const arrondissementInput = document.createElement("input");
  arrondissementInput.type = "text";
  arrondissementInput.name = "pv_arrondissement";
  arrondissementInput.id = "pv_arrondissement";
  arrondissementInput.disabled = true;

  formContainer.appendChild(arrondissementLabel);
  formContainer.appendChild(arrondissementInput);

  fetch("../pages/script/script_data_commune.php")
    .then((response) => response.json())
    .then((data) => {
      console.log("les communes : ", data);
      data.forEach((commune) => {
        const option = document.createElement("option");
        option.value = commune.id_comm;
        option.text = commune.commune;
        communeSelect.appendChild(option);
      });

      if (infraction.pv_commune) {
        for (let option of communeSelect.options) {
          if (option.value === infraction.pv_commune) {
            option.selected = true;
            communeSelect.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des communes :", error);
    });

  communeSelect.addEventListener("change", function () {
    const selectedCommuneId = communeSelect.value;

    fetch(`../pages/script/script_get_arrondissement.php?communeId=${selectedCommuneId}`)
      .then((response) => response.json())
      .then((data) => {
        arrondissementInput.value = data.arrondissement;
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération de l'arrondissement :", error);
      });
  });

  // Ajout des autres champs et labels
  const createLabelAndInput = (labelText, inputType, inputName, inputId) => {
    const label = document.createElement("label");
    label.innerHTML = labelText;
    const input = document.createElement("input");
    input.type = inputType;
    input.name = inputName;
    input.id = inputId;
    formContainer.appendChild(label);
    formContainer.appendChild(input);
    return input;
  };

  const enjeuxInput = createLabelAndInput("Enjeux :", "select", "pv_enjeux", "pv_enjeux");
  const contrevenantInput = createLabelAndInput("Contrevenant :", "text", "pv_contrevenant", "pv_contrevenant");
  const zonageInput = createLabelAndInput("Zonage :", "text", "pv_zonage", "pv_zonage");
  const correspondantInput = createLabelAndInput("Correspondant :", "text", "pv_correspondant", "pv_correspondant");
  const dateInput = createLabelAndInput("Date de l'infraction :", "date", "pv_date", "pv_date");
  const referenceInput = createLabelAndInput("Référence :", "text", "pv_reference", "pv_reference");
  const infractionInput = createLabelAndInput("Infraction :", "text", "pv_infraction", "pv_infraction");
  const obsInput = createLabelAndInput("Observations :", "text", "pv_obs", "pv_obs");

  const enjeuxOptions = [
    "PPRI", "PPRiF", "PPRMT", "loi Montagne", "loi littoral", "Natura 2000",
    "ZNIEFF", "Monuments historiques", "Sites inscrits classés", 
    "Parc national ou régional", "PLU", "SCOT"
  ];
  enjeuxOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.text = optionText;
    enjeuxInput.appendChild(option);
  });
  // Ajout des boutons de soumission et de fermeture
  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.classList = "Soumettre-infra";
  submitButton.addEventListener("click", function () {
    const pvDate = dateInput.value;
    const pvCommune = communeSelect.value;
    const pvReference = referenceInput.value;
    const pvCorrespondant = correspondantInput.value;
    const pvContrevenant = contrevenantInput.value;
    const pvEnjeux = enjeuxInput.value;
    const pvObs = obsInput.value;
    const pvType = typeInput.value;
    const pvArrondissement = arrondissementInput.value;
    const pvZonage = zonageInput.value;
    const natinfSelectElements = formContainer.querySelectorAll("select[name='pv_natinf']");
    const natinfValues = Array.from(natinfSelectElements).map((select) => select.value);
    console.log(" nums de natinf envoyés : ", natinfValues);
    // Obtenir la chaîne de requête (partie après le ?)
    const queryString = window.location.search;

// Créer un objet URLSearchParams à partir de la chaîne de requête
    const params = new URLSearchParams(queryString);

// Accéder à la variable 'id'
    const id = params.get('id');
  
    // Créer un objet FormData
    const formData = new FormData();
  
    // Ajouter les données au FormData
    formData.append("pv_date", pvDate);
    formData.append("pv_commune", pvCommune);
    formData.append("pv_reference", pvReference);
    formData.append("pv_correspondant", pvCorrespondant);
    formData.append("pv_contrevenant", pvContrevenant);
    formData.append("pv_enjeux", pvEnjeux);
    formData.append("pv_obs", pvObs);
    formData.append("pv_type", pvType);
    formData.append("pv_arrondissement", pvArrondissement);
    formData.append("pv_zonage", pvZonage);
  
    formData.append("pv_natinf", natinfValues.join(','));
    formData.append('id_dossier',id);
    

createInfraction(formData);

  });
    // Parcours et affiche les paires clé-valeur
    const submitButtontest = document.createElement("button");
    submitButtontest.innerText = "Test";
    submitButtontest.addEventListener("click", function () {
      const pvDate = dateInput.value;
    const pvCommune = communeSelect.value;
    const pvReference = referenceInput.value;
    const pvCorrespondant = correspondantInput.value;
    const pvContrevenant = contrevenantInput.value;
    const pvEnjeux = enjeuxInput.value;
    const pvObs = obsInput.value;
    const pvType = typeInput.value;
    const pvArrondissement = arrondissementInput.value;
    const pvZonage = zonageInput.value;
  
    const natinfSelectElements = formContainer.querySelectorAll("select[name='pv_natinf']");
    const natinfValues = Array.from(natinfSelectElements).map((select) => select.value);
    console.log(" nums de natinf envoyés : ", natinfValues);
    // Obtenir la chaîne de requête (partie après le ?)
    const queryString = window.location.search;

// Créer un objet URLSearchParams à partir de la chaîne de requête
    const params = new URLSearchParams(queryString);

// Accéder à la variable 'id'
    const id = params.get('id');
  
    // Créer un objet FormData
    const formData = new FormData();
  
    // Ajouter les données au FormData
    formData.append("pv_date", pvDate);
    formData.append("pv_commune", pvCommune);
    formData.append("pv_reference", pvReference);
    formData.append("pv_correspondant", pvCorrespondant);
    formData.append("pv_contrevenant", pvContrevenant);
    formData.append("pv_enjeux", pvEnjeux);
    formData.append("pv_obs", pvObs);
    formData.append("pv_type", pvType);
    formData.append("pv_arrondissement", pvArrondissement);
    formData.append("pv_zonage", pvZonage);
    formData.append("pv_natinf", natinfValues.join(','));
    formData.append('id_dossier',id);
    
  
for (let [key, value] of formData.entries()) {
  console.log(`${key}: ${value}`);
}});



  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.classList = "Fermer-infra";
  closeButton.addEventListener("click", function () {
    // Fermer la popup sans enregistrer les modifications
    Swal.close();
  });

  // Ajouter les boutons au conteneur du formulaire
  formContainer.appendChild(submitButton);
  formContainer.appendChild(submitButtontest);
  formContainer.appendChild(closeButton);
  
  // Afficher la popup avec le formulaire d'infraction
  Swal.fire({
    html: formContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
    didOpen: () => {
      // Ajouter une classe personnalisée au conteneur de la fenêtre modale
      const modalContainer = Swal.getPopup();
      if (modalContainer) {
        modalContainer.classList.add("infra-popup-cont");
      }
    },
  });
}

// Fonction pour récupérer les valeurs des champs natinf
function getNatinfValues() {
  const natinfSelectElements = document.querySelectorAll(
    "#pv_natinf,#pv_natinf_son"
  );
  const natinfValues = Array.from(natinfSelectElements).map(
    (select) => select.value
  );
  return natinfValues;
}

// Fonction pour créer une infraction avec les valeurs spécifiées
function createInfraction(formData) {
 
  // Récupérer les valeurs des champs natinf (si nécessaire)
  console.log('Valeurs de natinfValues dans la fonction createInfraction :', natinfValues);

  // Envoyer les données au script PHP pour la création de l'infraction
  fetch("../pages/script/infraction/script_creation_infraction.php", {
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
      // Afficher une Sweet Alert avec un message de succès
      Swal.fire({
        icon: "success",
        title: "Infraction créée avec succès",
        text: "L'infraction a été ajoutée avec succès.",
        showConfirmButton: true, // Afficher le bouton "OK"
      }).then((result) => {
        // Vérifier si l'utilisateur a cliqué sur "OK"
        if (result.isConfirmed) {
          // Rafraîchir la page lorsque l'utilisateur clique sur "OK"
          window.location.reload();
        }
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la création de l'infraction :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur de création",
        text: "Une erreur s'est produite lors de la création de l'infraction.",
      });
    });
}


// Fonction pour supprimer une infraction
function deleteInfraction(infractionId, dossierId) {
  // Envoyer les données au script PHP pour la suppression de l'infraction
  fetch("../pages/script/infraction/script_supprimer_infraction.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `infraction_id=${infractionId}&dossier_id=${dossierId}`, // Correction des noms des paramètres
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      // Afficher une Sweet Alert avec un message de succès
      Swal.fire({
        icon: "success",
        title: "Infraction supprimée avec succès",
        text: "L'infraction a été supprimée avec succès.",
        showConfirmButton: true, // Afficher le bouton "OK"
      }).then((result) => {
        // Rafraîchir la page lorsque l'utilisateur clique sur "OK"
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression de l'infraction :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur de suppression",
        text: "Une erreur s'est produite lors de la suppression de l'infraction.",
      });
    });
}

  // Déclaration et initialisation de addNatinfButton
  const addNatinfButton = document.createElement("button");
  addNatinfButton.innerText = "Ajouter Natinf";
  addNatinfButton.id = "btnAjouterNatinf";
// Fonction pour afficher la pop-up de modification d'infraction
function showInfractionPopup(infraction) {
  console.log("infraction dans modifier : ", infraction);

  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "infraction-form");

  const titre = document.createElement("label");
  titre.innerText = "Infraction";
  formContainer.appendChild(titre);

  const typeLabel = document.createElement("label");
  typeLabel.innerHTML = "Type :";
  const typeInput = document.createElement("select");
  typeInput.name = "pv_type";
  typeInput.id = "pv_type";
  const typeOptions = ["AIT", "Signalement", "PV"];
  typeOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.text = optionText;
    typeInput.appendChild(option);
  });

  formContainer.appendChild(typeLabel);
  formContainer.appendChild(typeInput);
  formContainer.appendChild(
    createNatinfGroup(
      formContainer,
      infraction.natinf_nums ? String(infraction.natinf_nums).split(",") : []
    )
  );

  const communeLabel = document.createElement("label");
  communeLabel.innerHTML = "Commune :";
  const communeSelect = document.createElement("select");
  communeSelect.name = "pv_commune";
  communeSelect.id = "pv_commune";

  const defaultOptionCommune = document.createElement("option");
  defaultOptionCommune.value = "";
  defaultOptionCommune.text = "Sélectionnez une commune";
  defaultOptionCommune.disabled = true;
  defaultOptionCommune.selected = true;
  communeSelect.appendChild(defaultOptionCommune);

  formContainer.appendChild(communeLabel);
  formContainer.appendChild(communeSelect);

  const arrondissementLabel = document.createElement("label");
  arrondissementLabel.innerHTML = "Arrondissement :";
  const arrondissementInput = document.createElement("input");
  arrondissementInput.type = "text";
  arrondissementInput.name = "pv_arrondissement";
  arrondissementInput.id = "pv_arrondissement";
  arrondissementInput.disabled = true;

  formContainer.appendChild(arrondissementLabel);
  formContainer.appendChild(arrondissementInput);

  fetch("../pages/script/script_data_commune.php")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((commune) => {
        const option = document.createElement("option");
        option.value = commune.id_comm;
        option.text = commune.commune;
        communeSelect.appendChild(option);
      });

      if (infraction.pv_commune) {
        for (let option of communeSelect.options) {
          if (option.value === infraction.pv_commune) {
            option.selected = true;
            communeSelect.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des communes :", error);
    });

  communeSelect.addEventListener("change", function () {
    const selectedCommuneId = communeSelect.value;

    fetch(`../pages/script/script_get_arrondissement.php?communeId=${selectedCommuneId}`)
      .then((response) => response.json())
      .then((data) => {
        arrondissementInput.value = data.arrondissement;
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération de l'arrondissement :", error);
      });
  });

  const createLabelAndInput = (labelText, inputType, inputName, inputId) => {
    const label = document.createElement("label");
    label.innerHTML = labelText;
    const input = document.createElement("input");
    input.type = inputType;
    input.name = inputName;
    input.id = inputId;
    formContainer.appendChild(label);
    formContainer.appendChild(input);
    return input;
  };

  const enjeuxInput = document.createElement("select");
  enjeuxInput.name = "pv_enjeux";
  enjeuxInput.id = "pv_enjeux";
  formContainer.appendChild(createLabelAndInput("Enjeux :", "select", "pv_enjeux", "pv_enjeux"));
  formContainer.appendChild(enjeuxInput);

  const contrevenantInput = createLabelAndInput("Contrevenant :", "text", "pv_contrevenant", "pv_contrevenant");
  const zonageInput = createLabelAndInput("Zonage :", "text", "pv_zonage", "pv_zonage");
  const correspondantInput = createLabelAndInput("Correspondant :", "text", "pv_correspondant", "pv_correspondant");
  const dateInput = createLabelAndInput("Date de l'infraction :", "date", "pv_date", "pv_date");
  const referenceInput = createLabelAndInput("Référence :", "text", "pv_reference", "pv_reference");
  const infractionInput = createLabelAndInput("Infraction :", "text", "pv_infraction", "pv_infraction");
  const obsInput = createLabelAndInput("Observations :", "text", "pv_obs", "pv_obs");

  const enjeuxOptions = [
    "PPRI", "PPRiF", "PPRMT", "loi Montagne", "loi littoral", "Natura 2000",
    "ZNIEFF", "Monuments historiques", "Sites inscrits classés", 
    "Parc national ou régional", "PLU", "SCOT"
  ];
  enjeuxOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText;
    option.text = optionText;
    enjeuxInput.appendChild(option);
  });

  typeInput.value = infraction.pv_type;
  communeSelect.value = infraction.pv_commune;
  arrondissementInput.value = infraction.pv_arrondissement;
  enjeuxInput.value = infraction.pv_enjeux;
  contrevenantInput.value = infraction.pv_contrevenant;
  zonageInput.value = infraction.pv_zonage;
  correspondantInput.value = infraction.pv_correspondant;
  dateInput.value = infraction.pv_date;
  referenceInput.value = infraction.pv_reference;
  infractionInput.value = infraction.pv_infraction;
  obsInput.value = infraction.pv_obs;

  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.classList = "Soumettre-infra";
  submitButton.addEventListener("click", function () {
    const pvDate = dateInput.value;
    const pvCommune = communeSelect.value;
    const pvReference = referenceInput.value;
    const pvCorrespondant = correspondantInput.value;
    const pvContrevenant = contrevenantInput.value;
    const pvEnjeux = enjeuxInput.value;
    const pvObs = obsInput.value;
    const pvType = typeInput.value;
    const pvArrondissement = arrondissementInput.value;
    const pvZonage = zonageInput.value;

    const natinfSelectElements = formContainer.querySelectorAll("select[name='pv_natinf']");
    const natinfValues = Array.from(natinfSelectElements).map((select) => select.value);
    console.log(" nums de natinf envoyés : ", natinfValues);

    const formData = new FormData();

    formData.append("pv_date", pvDate);
    formData.append("pv_commune", pvCommune);
    formData.append("pv_reference", pvReference);
    formData.append("pv_correspondant", pvCorrespondant);
    formData.append("pv_contrevenant", pvContrevenant);
    formData.append("pv_enjeux", pvEnjeux);
    formData.append("pv_obs", pvObs);
    formData.append("pv_type", pvType);
    formData.append("pv_arrondissement", pvArrondissement);
    formData.append("pv_zonage", pvZonage);
    formData.append('id_pv', infraction.id_pv);

    formData.append("pv_natinf", natinfValues.join(','));

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    modifyInfraction(infraction.id_pv, formData);

  });
      // Parcours et affiche les paires clé-valeur
      const submitButtontest = document.createElement("button");
      submitButtontest.innerText = "Test";
      submitButtontest.addEventListener("click", function () {
        const pvDate = dateInput.value;
      const pvCommune = communeSelect.value;
      const pvReference = referenceInput.value;
      const pvCorrespondant = correspondantInput.value;
      const pvContrevenant = contrevenantInput.value;
      const pvEnjeux = enjeuxInput.value;
      const pvObs = obsInput.value;
      const pvType = typeInput.value;
      const pvArrondissement = arrondissementInput.value;
      const pvZonage = zonageInput.value;
    
      const natinfSelectElements = formContainer.querySelectorAll("select[name='pv_natinf']");
      const natinfValues = Array.from(natinfSelectElements).map((select) => select.value);
      console.log(" nums de natinf envoyés : ", natinfValues);
      // Obtenir la chaîne de requête (partie après le ?)
      const queryString = window.location.search;
  
  // Créer un objet URLSearchParams à partir de la chaîne de requête
      const params = new URLSearchParams(queryString);
  
  // Accéder à la variable 'id'
      const id = params.get('id');
    
      // Créer un objet FormData
      const formData = new FormData();
    
      // Ajouter les données au FormData
      formData.append("pv_date", pvDate);
      formData.append("pv_commune", pvCommune);
      formData.append("pv_reference", pvReference);
      formData.append("pv_correspondant", pvCorrespondant);
      formData.append("pv_contrevenant", pvContrevenant);
      formData.append("pv_enjeux", pvEnjeux);
      formData.append("pv_obs", pvObs);
      formData.append("pv_type", pvType);
      formData.append("pv_arrondissement", pvArrondissement);
      formData.append("pv_zonage", pvZonage);
      formData.append("pv_natinf", natinfValues.join(','));
      formData.append('id_dossier',id);
      
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }});
  

  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.classList = "Fermer-infra";
  closeButton.addEventListener("click", function () {
    Swal.close();
  });

  formContainer.appendChild(submitButton);
  formContainer.appendChild(submitButtontest);

  formContainer.appendChild(closeButton);

  Swal.fire({
    html: formContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
    didOpen: () => {
      const modalContainer = Swal.getPopup();
      if (modalContainer) {
        modalContainer.classList.add("infra-popup-cont");
      }
    },
  });
  
}

// Ajoutez un écouteur d'événements pour détecter les changements dans le champ de sélection de la commune
communeSelect.addEventListener("change", function () {
  const selectedCommuneId = communeSelect.value;
  let selectedCommuneName = "";

  // Vérifiez s'il y a une option sélectionnée
  if (communeSelect.selectedIndex >= 0) {
    selectedCommuneName = communeSelect.options[communeSelect.selectedIndex].text; // Récupérer le nom de la commune sélectionnée
  }

  // Effectuez une requête AJAX pour récupérer l'arrondissement correspondant à la commune sélectionnée
  fetch(`../pages/script/script_get_arrondissement.php?communeId=${selectedCommuneId}`)
    .then((response) => response.json())
    .then((data) => {
      // Mettez à jour le champ d'arrondissement avec la valeur récupérée
      arrondissementInput.value = data.arrondissement;
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération de l'arrondissement :", error);
    });
});

// Ajout de la liste déroulante pour les enjeux
const enjeuxLabel = document.createElement("label");
enjeuxLabel.innerHTML = "Enjeux :";
const enjeuxInput = document.createElement("select");
enjeuxInput.name = "pv_enjeux";
enjeuxInput.id = "pv_enjeux";
const enjeuxOptions = [
  "PPRI",
  "PPRiF",
  "PPRMT",
  "loi Montagne",
  "loi littoral",
  "Natura 2000",
  "ZNIEFF",
  "Monuments historiques",
  "Sites inscrits classés",
  "Parc national ou régional",
  "PLU",
  "SCOT",
];
enjeuxOptions.forEach((optionText) => {
  const option = document.createElement("option");
  option.value = optionText;
  option.text = optionText;
  enjeuxInput.appendChild(option);
});

const contrevenantLabel = document.createElement("label");
contrevenantLabel.innerHTML = "Contrevenant :";
const contrevenantInput = document.createElement("input");
contrevenantInput.type = "text";
contrevenantInput.name = "pv_contrevenant";
contrevenantInput.id = "pv_contrevenant";

const zonageLabel = document.createElement("label");
zonageLabel.innerHTML = "Zonage :";
const zonageInput = document.createElement("input");
zonageInput.type = "text";
zonageInput.name = "pv_zonage";
zonageInput.id = "pv_zonage";

const correspondantLabel = document.createElement("label");
correspondantLabel.innerHTML = "Correspondant :";
const correspondantInput = document.createElement("input");
correspondantInput.type = "text";
correspondantInput.name = "pv_correspondant";
correspondantInput.id = "pv_correspondant";

const dateLabel = document.createElement("label");
dateLabel.innerHTML = "Date de l'infraction :";
const dateInput = document.createElement("input");
dateInput.type = "date";
dateInput.name = "pv_date";
dateInput.id = "pv_date";

const referenceLabel = document.createElement("label");
referenceLabel.innerHTML = "Référence :";
const referenceInput = document.createElement("input");
referenceInput.type = "text";
referenceInput.name = "pv_reference";
referenceInput.id = "pv_reference";

const infractionLabel = document.createElement("label");
infractionLabel.innerHTML = "Infraction :";
const infractionInput = document.createElement("input");
infractionInput.type = "text";
infractionInput.name = "pv_infraction";
infractionInput.id = "pv_infraction";

const obsLabel = document.createElement("label");
obsLabel.innerHTML = "Observations :";
const obsInput = document.createElement("input");
obsInput.type = "text";
obsInput.name = "pv_obs";
obsInput.id = "pv_obs";

const parcellePrinLabel = document.createElement("label");
parcellePrinLabel.innerHTML = "Parcelle Principale :";
const parcellePrinInput = document.createElement("input");
parcellePrinInput.type = "text";
parcellePrinInput.name = "pv_parcelle_prin";
parcellePrinInput.id = "pv_parcelle_prin";

const parcellesAutresLabel = document.createElement("label");
parcellesAutresLabel.innerHTML = "Parcelles Autres :";
const parcellesAutresInput = document.createElement("input");
parcellesAutresInput.type = "text";
parcellesAutresInput.name = "pv_parcelles_autres";
parcellesAutresInput.id = "pv_parcelles_autres";

const detruitLabel = document.createElement("label");
detruitLabel.innerHTML = "Détruit :";
const detruitInput = document.createElement("input");
detruitInput.type = "checkbox"; // Changement du type en checkbox
detruitInput.name = "pv_detruit";
detruitInput.id = "pv_detruit";

const cabanisationLabel = document.createElement("label");
cabanisationLabel.innerHTML = "Cabanisation :";
const cabanisationInput = document.createElement("input");
cabanisationInput.type = "checkbox"; // Changement du type en checkbox
cabanisationInput.name = "pv_cabanisation";
cabanisationInput.id = "pv_cabanisation";

const infraObsLabel = document.createElement("label");
infraObsLabel.innerHTML = "Observations Infra :";
const infraObsInput = document.createElement("input");
infraObsInput.type = "text";
infraObsInput.name = "pv_infra_obs";
infraObsInput.id = "pv_infra_obs";

// Ajouter les champs au conteneur du formulaire
formContainer.appendChild(typeLabel);
formContainer.appendChild(typeInput);
formContainer.appendChild(communeLabel);
formContainer.appendChild(communeSelect);
formContainer.appendChild(arrondissementLabel);
formContainer.appendChild(arrondissementInput);
formContainer.appendChild(contrevenantLabel);
formContainer.appendChild(contrevenantInput);
formContainer.appendChild(correspondantLabel);
formContainer.appendChild(correspondantInput);
formContainer.appendChild(dateLabel);
formContainer.appendChild(dateInput);
formContainer.appendChild(referenceLabel);
formContainer.appendChild(referenceInput);
formContainer.appendChild(infractionLabel);
formContainer.appendChild(infractionInput);

formContainer.appendChild(natinfLabel);
formContainer.appendChild(natinfSelect);
formContainer.appendChild(addNatinfButton);
formContainer.appendChild(detruitLabel);
formContainer.appendChild(detruitInput);
formContainer.appendChild(enjeuxLabel);
formContainer.appendChild(enjeuxInput);
formContainer.appendChild(obsLabel);
formContainer.appendChild(obsInput);
formContainer.appendChild(zonageLabel);
formContainer.appendChild(zonageInput);
formContainer.appendChild(parcellePrinLabel);
formContainer.appendChild(parcellePrinInput);
formContainer.appendChild(parcellesAutresLabel);
formContainer.appendChild(parcellesAutresInput);
formContainer.appendChild(cabanisationLabel);
formContainer.appendChild(cabanisationInput);
formContainer.appendChild(infraObsLabel);
formContainer.appendChild(infraObsInput);

// Ajouter les valeurs des champs de l'infraction
typeInput.value = infraction.pv_type;
natinfSelect.value = infraction.pv_natinf;
dateInput.value = infraction.pv_date;
communeSelect.value = infraction.pv_commune;
arrondissementInput.value = infraction.pv_arrondissement;
contrevenantInput.value = infraction.pv_contrevenant;
correspondantInput.value = infraction.pv_correspondant;
referenceInput.value = infraction.pv_reference;
infractionInput.value = infraction.pv_infraction;
obsInput.value = infraction.pv_obs;
enjeuxInput.value = infraction.pv_enjeux;
detruitInput.checked = infraction.pv_detruit === "1";
cabanisationInput.checked = infraction.pv_cabanisation === "1";
parcellePrinInput.value = infraction.pv_parcelle_prin;
parcellesAutresInput.value = infraction.pv_parcelles_autres;
zonageInput.value = infraction.pv_zonage;
infraObsInput.value = infraction.pv_infra_obs;

// Ajout des boutons de soumission et de fermeture
const submitButton = document.createElement("button");
submitButton.innerText = "Soumettre";
submitButton.classList = "Soumettre-infra";
submitButton.addEventListener("click", function () {
  // Récupérer les valeurs des champs du formulaire
  const pvDate = dateInput.value;
  const pvCommune = communeSelect.value;
  const pvReference = referenceInput.value;
  const pvCorrespondant = correspondantInput.value;
  const pvContrevenant = contrevenantInput.value;
  const pvEnjeux = enjeuxInput.value;
  const pvObs = obsInput.value;
  const pvType = typeInput.value;
  const pvParcellePrin = parcellePrinInput.value;
  const pvParcellesAutres = parcellesAutresInput.value;
  const pvArrondissement = arrondissementInput.value;
  const pvZonage = zonageInput.value;
  const pvCabanisation = cabanisationInput.checked ? 1 : 0; // Vérifier si la case est cochée
  const pvDetruit = detruitInput.checked ? 1 : 0; // Vérifier si la case est cochée
  const pvInfraObs = infraObsInput.value;

  // Récupérer les valeurs des champs natinf au moment du clic sur "Soumettre"
  const natinfSelectElements = formContainer.querySelectorAll("#pv_natinf_son");
  const natinfValues = Array.from(natinfSelectElements).map((select) => select.value);

  // Appeler la fonction pour créer l'infraction avec les valeurs récupérées
  createInfraction(
    pvDate,
    pvReference,
    pvCorrespondant,
    pvContrevenant,
    pvEnjeux,
    pvObs,
    pvType,
    pvParcellePrin,
    pvParcellesAutres,
    pvArrondissement,
    selectedCommuneName,
    pvDetruit,
    pvZonage,
    pvCabanisation,
    pvInfraObs,
    natinfValues
  );
});

const closeButton = document.createElement("button");
closeButton.innerText = "Fermer";
closeButton.classList = "Fermer-infra";
closeButton.addEventListener("click", function () {
  // Fermer la popup sans enregistrer les modifications
  Swal.close();
});

// Ajouter les boutons au conteneur du formulaire
formContainer.appendChild(submitButton);
formContainer.appendChild(closeButton);

// Afficher la popup avec le formulaire d'infraction
Swal.fire({
  html: formContainer,
  showConfirmButton: false,
  showCloseButton: false,
  showCancelButton: false,
  didOpen: () => {
    // Ajouter une classe personnalisée au conteneur de la fenêtre modale
    const modalContainer = Swal.getPopup();
    if (modalContainer) {
      modalContainer.classList.add("infra-popup-cont");
    }
  },
});


function modifyInfraction(infractionId, formData) {
  
  // Envoyer les données au script PHP pour la modification de l'infraction
  fetch("../pages/script/infraction/script_modifier_infraction.php", {
    method: "POST",
    body: formData, // Envoyer les données du formulaire
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      // Traiter la réponse JSON
      Swal.fire({
        icon: "success",
        title: "Infraction modifiée avec succès",
        text: "Les modifications ont été enregistrées avec succès.",
        showConfirmButton: true, // Afficher le bouton "OK"
      }).then((result) => {
        // Rafraîchir la page lorsque l'utilisateur clique sur "OK"
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la modification de l'infraction :", error);
      // Afficher une alerte d'erreur
      Swal.fire({
        icon: "error",
        title: "Erreur de modification",
        text: "Une erreur s'est produite lors de la modification de l'infraction.",
      });
    });
}
// Fonction pour ajouter un nouveau champ natinf
function addNatinfField(container) {
  console.log(container);

  const newNatinfSelect = document.createElement("select");
  newNatinfSelect.name = "pv_natinf";
  newNatinfSelect.id = `pv_natinf_new`;

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.text = "Sélectionnez une natinf";
  defaultOption.selected = true;
  newNatinfSelect.appendChild(defaultOption);

  fetch("../pages/script/natinf/script_lecture_natinf.php")
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      data.forEach(natinf => {
        const option = document.createElement("option");
        option.value = natinf.id_natinf; // Adaptez ceci si le nom du champ est différent
        option.text = natinf.Num;  // Adaptez ceci si le nom du champ est différent
        newNatinfSelect.appendChild(option);
      });

      // Insertion des nouveaux champs après avoir chargé les options
      container.insertBefore(newNatinfSelect, addNatinfButton.nextSibling);
    })
    .catch(error => console.error('Erreur lors de la récupération des données:', error));
}