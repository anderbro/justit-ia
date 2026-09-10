let statutsData;
document.addEventListener("DOMContentLoaded", function () {
  const btnAjouterContrevenantPhys = document.getElementById(
    "btnAjouterContrevenantPhys"
  );
  const btnAjouterContrevenantMor = document.getElementById(
    "btnAjouterContrevenantMor"
  );
  const btnChercherContrevenant = document.getElementById(
    "btnChercherContrevenant"
  );

  btnChercherContrevenant.addEventListener("click", function () {
    // Appeler une fonction pour gérer la recherche de contrevenant
    showSearchPopup();
  });

  btnAjouterContrevenantPhys.addEventListener("click", function () {
    showPopupForm("Personne Physique");
  });

  btnAjouterContrevenantMor.addEventListener("click", function () {
    showPopupForm("Personne Morale");
  });

  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");

  if (dossierId !== null) {
    console.log("id dossier :", dossierId);
  } else {
    console.log("Le paramètre 'id' est absent dans l'URL.");
  }

  fetch(
    `../pages/script/contrevenant/script_details_contrevenant.php?id=${dossierId}`,
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
      console.log("Contrevenants reçus :", data);

      const resumeCont = document.getElementById("resumecont");
      const tableContrevenants = document.getElementById("tableContrevenants");
      // Effacer le contenu existant du tableau
      tableContrevenants.querySelector("tbody").innerHTML = "";

      if (
        tableContrevenants &&
        data.contrevenants &&
        data.contrevenants.length > 0
      ) {
        // Parcourir tous les contrevenants reçus
        data.contrevenants.forEach((contrevenant,index) => {
          // Ajouter une nouvelle ligne au tableau
          const newRow = tableContrevenants.querySelector("tbody").insertRow();
          

          // Ajouter des cellules à la ligne
          const identiteCell = newRow.insertCell(0);
          const statutCell = newRow.insertCell(1);
          const representantLegalCell = newRow.insertCell(2);
          const actionCell = newRow.insertCell(3);
          actionCell.classList = "bouton-tab-cont-infraction";

          // Remplir les cellules avec les données du contrevenant
          identiteCell.innerHTML =
            contrevenant.contrevenant ?? contrevenant.nom;
          statutCell.innerHTML = contrevenant.nom_statut_contrevenant;
          representantLegalCell.innerHTML = contrevenant.representant_legal;

          // Ajouter le bouton "Modifier"
          const modifyButton = document.createElement("button");
          modifyButton.classList = "bouton-modification-contrevenant";
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            // Appeler une fonction pour afficher la popup de modification
            // c'est là qu'il faut faire un truc :
            //aller vers un popupfomr prérempli
            //affiche un form pour personne physique ou morale si le siret existe
        if (contrevenant.SIRET_SIREN !=null){
          showModifyPopup("Personne Morale",dossierId,statutsData,index);
        console.log("index : ",index);
        console.log("StatutsData : ", statutsData);
        }else{
          showModifyPopup("Personne Physique",dossierId,statutsData,index);
          console.log("index : ",index);
          console.log("StatutsData : ", statutsData);


        }
          
          
        });
          actionCell.appendChild(modifyButton);

          const deleteButton = document.createElement("button");
          deleteButton.classList = "bouton-suppression-contrevenant";
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            // Ajouter une confirmation avant la suppression
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer ce contrevenant?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                // Appeler une fonction pour gérer la suppression
                deleteContrevenant(contrevenant.id_contrevenant, dossierId);
              }
            });
          });
          actionCell.appendChild(deleteButton);
        });

        // Utiliser uniquement le premier contrevenant pour le résumé
        const premierContrevenant = data.contrevenants[0];

        if (premierContrevenant) {
          const identiteSlot = document.getElementById("resumeIdentite") || resumeCont;
          identiteSlot.innerHTML = "";

          function appendIdentiteField(labelText, value) {
            const field = document.createElement("div");
            field.className = "resume-field";
            const label = document.createElement("label");
            label.textContent = labelText;
            const input = document.createElement("input");
            input.type = "text";
            input.value = value || "";
            input.disabled = true;
            field.appendChild(label);
            field.appendChild(input);
            identiteSlot.appendChild(field);
          }

          if (!premierContrevenant.nom && !premierContrevenant.prenom) {
            appendIdentiteField(
              "Contrevenant",
              premierContrevenant.contrevenant || "Aucun contrevenant spécifié"
            );
          } else {
            appendIdentiteField("Nom du contrevenant", premierContrevenant.nom);
            appendIdentiteField("Prénom du contrevenant", premierContrevenant.prenom);
          }
        }
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la récupération des contrevenants.",
      });
    });
});

function getFormData(type, container) {
  const formData = {};
  const formElements = container.querySelectorAll("input, select");
  console.log(" form elements dans la fonction getformdata", formElements);

  // Liste des champs obligatoires pour chaque type
  const requiredFields = {
    "Personne Physique": ["nom", "prenom", "civilite", "statut"],
    "Personne Morale": ["nom", "SIRET_SIREN", "statut", "representant_legal"],
  };

  formElements.forEach((element) => {
    formData[element.name] = element.value;
  });

  // Vérifier les champs obligatoires
  const missingFields = requiredFields[type].filter(
    (field) => !formData[field]
  );

  if (missingFields.length > 0) {
    // Afficher un message d'erreur si des champs obligatoires sont manquants
    Swal.fire({
      icon: "error",
      title: "Champs obligatoires manquants",
      html: `Les champs suivants sont obligatoires : <br>${missingFields.join(
        ", "
      )}`,
    });
    throw new Error("Champs obligatoires manquants");
  }

  // Si c'est une personne morale, ajouter le statut spécifique
  if (type === "Personne Morale") {
    const statutSelect = container.querySelector("select[name='statut']");
    formData["statut"] = statutSelect ? statutSelect.value : "";
  }

  return formData;
}

function showPopupForm(type) {
  // Créer les éléments HTML du formulaire
  const formContainer = document.createElement("div");
  const dossierId = urlParams.get("id");
  formContainer.classList.add("popup-form");
  const title = document.createElement("h2");
  title.className = "popup-title";
  title.textContent = type === "Personne Morale" ? "Personne morale" : "Personne physique";
  formContainer.appendChild(title);

  // Appeler la fonction pour générer les champs en fonction du type
  generateFields(type, formContainer, statutsData);
  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.addEventListener("click", function () {
    // Gérer la soumission du formulaire ici
    const formData = getFormData(type, formContainer);
    console.log("Données du formulaire :", formData);

    // Utiliser FormData pour envoyer les valeurs au serveur
    const formDataObject = new FormData();

    // Ajouter les champs du formulaire
    for (const key in formData) {
      formDataObject.append(key, formData[key]);
    }

    // Ajouter l'ID du dossier
    formDataObject.append("id_dossier", dossierId); 

    let endpoint = "";
    if (type === "Personne Physique" || type === "Personne Morale") {
      endpoint =
        "../pages/script/contrevenant/script_creation_contrevenant.php?type=" +
        type;
    }

    fetch(endpoint, {
      method: "POST",
      body: formDataObject,
    })
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
            text: "Contrevenant enregistré avec succès.",
          }).then(() => {
            // Actualiser la liste des contrevenants après l'ajout ou la modification
            location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Une erreur s'est produite lors de l'enregistrement du contrevenant.",
          });
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la requête AJAX : ", error);
        Swal.fire({
          icon: "error",
          title: "Erreur AJAX",
          text: "Une erreur s'est produite lors de l'envoi du formulaire au serveur.",
        });
      });
  });

  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.addEventListener("click", function () {
    // Fermer la popup sans enregistrer les modifications
    Swal.close();
  });

  // Ajouter les éléments au conteneur du formulaire
  formContainer.appendChild(submitButton);
  formContainer.appendChild(closeButton);

  // Afficher la popup avec le formulaire
  Swal.fire({
    html: formContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
  });

}

function generateFields(type, container, statutsData) {
  // Ajouter des champs spécifiques en fonction du type
  if (type === "Personne Morale") {
    const labelNom = document.createElement("label");
    labelNom.innerHTML = "Nom :";
    const inputNom = document.createElement("input");
    inputNom.type = "text";
    inputNom.name = "nom";
    container.appendChild(labelNom);
    container.appendChild(inputNom);

    const labelSiret = document.createElement("label");
    labelSiret.innerHTML = "SIRET :";
    const inputSiret = document.createElement("input");
    inputSiret.type = "text";
    inputSiret.name = "SIRET_SIREN";
    container.appendChild(labelSiret);
    container.appendChild(inputSiret);

    const labelAdresseSiegeSocial = document.createElement("label");
    labelAdresseSiegeSocial.innerHTML = "Adresse du siège social :"; 
    const inputAdresseSiegeSocial = document.createElement("input");
    inputAdresseSiegeSocial.type = "text";
    inputAdresseSiegeSocial.name = "adresse_siege";
    container.appendChild(labelAdresseSiegeSocial);
    container.appendChild(inputAdresseSiegeSocial);

    // Ajouter le champ pour le représentant légal
    const labelRepresentantLegal = document.createElement("label");
    labelRepresentantLegal.innerHTML = "Représentant légal :";
    const inputRepresentantLegal = document.createElement("input");
    inputRepresentantLegal.type = "text";
    inputRepresentantLegal.name = "representant_legal";
    container.appendChild(labelRepresentantLegal);
    container.appendChild(inputRepresentantLegal);

    const labelStatut = document.createElement("label");
    labelStatut.innerHTML = "Statut :";
    const selectStatut = document.createElement("select");
    selectStatut.name = "statut";

    // Ajouter les options de statut récupérées depuis statutsData
    for (const statut of statutsData) {
      const optionElement = document.createElement("option");
      optionElement.value = statut.id_statut_contrevenant;
      optionElement.text = statut.nom_statut_contrevenant;
      selectStatut.appendChild(optionElement);
    }

    container.appendChild(labelStatut);
    container.appendChild(selectStatut);
  } else {
    const labelCivilite = document.createElement("label");
    labelCivilite.innerHTML = "Civilité :";
    const selectCivilite = document.createElement("select");
    selectCivilite.name = "civilite";

    // Ajouter les options à la liste déroulante
    const civiliteOptions = ["Monsieur", "Madame"];
    for (const option of civiliteOptions) {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.text = option;
      selectCivilite.appendChild(optionElement);
    }

    container.appendChild(labelCivilite);
    container.appendChild(selectCivilite);

    const labelNom = document.createElement("label");
    labelNom.innerHTML = "Nom :";
    const inputNom = document.createElement("input");
    inputNom.type = "text";
    inputNom.name = "nom";
    container.appendChild(labelNom);
    container.appendChild(inputNom);

    const labelPrenom = document.createElement("label");
    labelPrenom.innerHTML = "Prénom :";
    const inputPrenom = document.createElement("input");
    inputPrenom.type = "text";
    inputPrenom.name = "prenom";
    container.appendChild(labelPrenom);
    container.appendChild(inputPrenom);

    const labelDateNaissance = document.createElement("label");
    labelDateNaissance.innerHTML = "Date de naissance :";
    const inputDateNaissance = document.createElement("input");
    inputDateNaissance.type = "date";
    inputDateNaissance.name = "date_naissance";
    inputDateNaissance.classList.add("input-date-naissance");
    container.appendChild(labelDateNaissance);
    container.appendChild(inputDateNaissance);

    const labelLieuNaissance = document.createElement("label");
    labelLieuNaissance.innerHTML = "Lieu de naissance :";
    const inputLieuNaissance = document.createElement("input");
    inputLieuNaissance.type = "text";
    inputLieuNaissance.name = "lieu_naissance";
    container.appendChild(labelLieuNaissance);
    container.appendChild(inputLieuNaissance);

    const labelAdresse = document.createElement("label");
    labelAdresse.innerHTML = "Adresse :";
    const inputAdresse = document.createElement("input");
    inputAdresse.type = "text";
    inputAdresse.name = "adresse"; // Correction ici
    container.appendChild(labelAdresse);
    container.appendChild(inputAdresse);

    const labelStatut = document.createElement("label");
    labelStatut.innerHTML = "Statut :";
    const selectStatut = document.createElement("select");
    selectStatut.name = "statut";

    // Ajouter les options de statut récupérées depuis statutsData
    for (const statut of statutsData) {
      const optionElement = document.createElement("option");
      optionElement.value = statut.id_statut_contrevenant;
      optionElement.text = statut.nom_statut_contrevenant;
      selectStatut.appendChild(optionElement);
    }

    container.appendChild(labelStatut);
    container.appendChild(selectStatut);
  }

  // Si c'est une modification, ajouter un champ pour l'ID
  if (type !== "Personne Physique" && type !== "Personne Morale") {
    const inputId = document.createElement("input");
    inputId.type = "hidden";
    inputId.name = "id";
    container.appendChild(inputId);
  }

}

document.addEventListener("DOMContentLoaded", function () {
  // Récupérer la liste déroulante des statuts
  // const selectStatut = document.getElementById("selectStatut");

  // Récupérer les données des statuts depuis le script PHP
  fetch("../pages/script/contrevenant/script_statut_contrevenant.php", {
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
      // Afficher les données récupérées dans la console
      // console.log("contrevenants rtforteotreotro");
      statutsData = data;
      // Remplir la liste déroulante avec les statuts récupérés
      // data.forEach((statut) => {
      //   console.log("contrevenant id :", statut.id_statut_contrevenant);
      //   console.log("contrevenant id :", statut.nom_statut_contrevenant);
      //   const option = document.createElement("option");
      // option.value = statut.id_statut_contrevenant; // Assurez-vous que votre table contient un champ "id" pour l'ID du statut
      // option.text = statut.nom_statut_contrevenant; // Assurez-vous que votre table contient un champ "nom" pour le nom du statut
      // selectStatut.appendChild(option);
      // });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des statuts :", error);
    });
});

////////////////////PARTIE RECHERCHE ET JOINTURE////

function showSearchPopup() {
  const searchContainer = document.createElement("div");
  searchContainer.classList.add("popup-form");

  const labelSearch = document.createElement("label");
  labelSearch.innerHTML = "Rechercher par nom :";
  const inputSearch = document.createElement("input");
  inputSearch.type = "text";
  inputSearch.name = "search";
  searchContainer.appendChild(labelSearch);
  searchContainer.appendChild(inputSearch);

  const submitButton = document.createElement("button");
  submitButton.innerText = "Rechercher";
  submitButton.addEventListener("click", function () {
    // Gérer la recherche ici
    const searchValue = inputSearch.value;
    console.log("Valeur de recherche :", searchValue);

    // Appeler la fonction pour effectuer la recherche
    searchContrevenant(searchValue);
    Swal.close();
  });

  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.addEventListener("click", function () {
    // Fermer la popup de recherche
    Swal.close();
  });

  // Ajouter les éléments au conteneur de recherche
  searchContainer.appendChild(submitButton);
  searchContainer.appendChild(closeButton);

  // Afficher la popup de recherche
  Swal.fire({
    html: searchContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
  });
}

// Ajouter une fonction pour afficher la popup de modification
function showModifyPopup(type, dossierId, statutsData, index) {
  // Récupérer les données du contrevenant
  fetch(`../pages/script/contrevenant/script_details_contrevenant.php?id=${dossierId}`, {
      method: "GET",
      headers: {
          "Content-Type": "application/x-www-form-urlencoded",
      },
  })
  .then((contrevenantResponse) => {
      if (!contrevenantResponse.ok) {
          throw new Error("Erreur HTTP, statut : " + contrevenantResponse.status);
      }
      return contrevenantResponse.json();
  })
  .then((contrevenantData) => {
      console.log("Contrevenant reçu :", contrevenantData);
      const modifyContainer = document.createElement("div");
      modifyContainer.classList.add("popup-form");
      console.log("formContainer ça ressemble à quoi ?? : ",modifyContainer);

      console.log("container : ", modifyContainer);
      console.log(" id contrevenant : ", contrevenantData["contrevenants"][index]['id_contrevenant']);
      
      const titre = document.createElement("h2");
      titre.className = "popup-title";
      titre.textContent = "Modifier le contrevenant";
      modifyContainer.appendChild(titre);

      // Appeler la fonction pour générer les champs en fonction du type
      generateFields(type, modifyContainer, statutsData);

      fillFormFields(contrevenantData, modifyContainer, index,statutsData);
      


      const submitButton = document.createElement("button");
      submitButton.innerText = "Enregistrer les modifications";
      submitButton.addEventListener("click", function () {
          // Gérer la soumission du formulaire ici
          const formData = getFormData(type, modifyContainer);
          console.log("form data en sortie de  fonction : ", formData);
          
          
          // ajout Id à FormData
          formData.id = contrevenantData["contrevenants"][index]['id_contrevenant']; // Ajouter l'ID du contrevenant
          console.log("id formData : ", formData.id);
          console.log("formData : ", formData);

          // création de l'objet FormData ( au bon format ) pour l'envoie côté serveur
          const formDataObject = new FormData();

          //remplissage de l'objet FormData, pair[0] = clé de champs, pair[1] = valeur du champs
          for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
              formDataObject.append(key, formData[key]);
                }
          }
          //Retour console pour voir comment se rempli le FormData
          for (const pair of formDataObject.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
          }          
          // appel du script PHP
          const endpoint = "../pages/script/contrevenant/script_modifier_contrevenant.php";
          fetch(endpoint, {
            //méthod approprié pour le type FormData
              method: "POST",
              body: formDataObject,
          })

          // EST CE QUE ça MARCHE ???
          .then((response) => {
              if (!response.ok) {
                  throw new Error("Erreur HTTP, statut : " + response.status);
              }
              return response.json();
          })
          .then((data) => {
              console.log("Réponse du serveur pour la modification :", data);

              // Traiter la réponse du serveur ici
              if (data.success) {
                  Swal.fire({
                      icon: "success",
                      title: "Succès",
                      text: "Contrevenant modifié avec succès.",
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
              console.error("Erreur lors de la requête AJAX : ", error);
              Swal.fire({
                  icon: "error",
                  title: "Erreur AJAX",
                  text: "Une erreur s'est produite lors de l'envoi du formulaire au serveur.",
              });
          });
      });
      // Bouton de fermeture du Popup
      const closeButton = document.createElement("button");
      closeButton.innerText = "Fermer";
      closeButton.addEventListener("click", function () {
          // Fermer la popup sans enregistrer les modifications
          Swal.close();
      });

      // Ajouter les éléments au conteneur de modification 

      modifyContainer.appendChild(submitButton);
      modifyContainer.appendChild(closeButton);

      // Afficher la popup avec le formulaire de modification
      Swal.fire({
          html: modifyContainer,
          showConfirmButton: false,
          showCloseButton: false,
          showCancelButton: false,
      });
  })
  .catch((error) => {
      console.error("Erreur lors de la récupération du contrevenant :", error);
      // Gérer l'erreur ici, par exemple afficher un message à l'utilisateur
  });
}



// Ajouter une fonction pour remplir les champs du formulaire de modification
// Elle prend en paramètre  : contrevenants : les contrevenants relatifs au dossier étudié
//                            container : les champs/elements du formulaire (Morale ou physique)
//                            Index : le numéro relatifs au contrevenant observé !!!! index != id_contrevenant
function fillFormFields(contrevenants, container, index, statutsData) {
  // Récupérer les éléments du formulaire
  const formElements = container.querySelectorAll("input, select");
  console.log("Données du contrevenant test :", contrevenants["contrevenants"][index]["nom"]);
  console.log("Données du contrevenant test statut :", contrevenants["contrevenants"][index]['nom_statut_contrevenant']);

  // Remplir les champs avec les données du contrevenant
  for (const element of formElements) {
      const fieldName = element.name;

      // Si le champ est un menu déroulant
      if (element.tagName === "SELECT" && fieldName === "statut") {
          const fieldValue = contrevenants["contrevenants"][index]['nom_statut_contrevenant'];
          console.log('nom statut contrevenant : ', fieldValue);

          // Vider les options actuelles du menu déroulant
          element.innerHTML = '';

          // Ajouter les options à partir de statutsData
          for (const statut of statutsData) {
              const option = document.createElement('option');
              option.value = statut.id_statut_contrevenant;
              option.text = statut.nom_statut_contrevenant;

              // Sélectionner cette option si elle correspond à la valeur actuelle
              if (statut.nom_statut_contrevenant === fieldValue) {
                  option.selected = true;
              }

              element.appendChild(option);
          }
      } else {
          // Si le champ n'est pas un menu déroulant, remplir normalement
          if (fieldName in contrevenants["contrevenants"][index]) {
              element.value = contrevenants["contrevenants"][index][fieldName];
          }
      }
  }
}



const urlParams = new URLSearchParams(window.location.search);
const dossierId = urlParams.get("id");

function deleteContrevenant(id, dossierId) {
  // Gérer la suppression du contrevenant ici
  console.log("Suppression du contrevenant avec l'ID :", id);

  // Faire une requête AJAX pour supprimer le contrevenant
  fetch(
    `../pages/script/contrevenant/script_suppression_contrevenant.php?id=${id}&dossierId=${dossierId}`,
    {
      method: "DELETE",
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
          text: "Contrevenant supprimé avec succès.",
          confirmButtonText: "OK",
        }).then(() => {
          // Actualiser la liste des contrevenants après l'ajout ou la modification
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la suppression du contrevenant.",
          confirmButtonText: "OK",
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la suppression du contrevenant.",
        confirmButtonText: "OK",
      });
    });
}

function searchContrevenant(searchValue) {
  // Gérer la recherche de contrevenant ici
  console.log("Recherche de contrevenant avec la valeur :", searchValue);

  // Faire une requête AJAX pour rechercher les contrevenants
  fetch(
    `../pages/script/contrevenant/script_recherche_contrevenant.php?search=${searchValue}`,
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
      console.log("Résultats de la recherche :", data);
      //   console.log("id du contervenant: " + data.id_contrevenant);
      // Créer les éléments HTML de la popup de jointure
      const joinContainer = document.createElement("div");
      joinContainer.classList.add("popup-form");

      // Ajouter les résultats de la recherche à la popup
      if (data.results && data.results.length > 0) {
        const resultsList = document.createElement("ul");

        data.results.forEach((contrevenant) => {
          const listItem = document.createElement("li");
          listItem.innerHTML = `<span>${contrevenant.contrevenant} - ${contrevenant.statut} - ${contrevenant.representant_legal}</span>`;

          // Ajouter le bouton "Joindre au dossier" à droite de chaque résultat
          const joinButton = document.createElement("button");

          joinButton.innerText = "Joindre au dossier";
          joinButton.addEventListener("click", function () {
            // Appeler une fonction pour effectuer la jointure avec le dossier
            joinContrevenantToDossier(contrevenant.id_contrevenant);
            Swal.close();
          });

          listItem.appendChild(joinButton);
          resultsList.appendChild(listItem);
        });

        joinContainer.appendChild(resultsList);
      }

      // Afficher la popup de jointure
      Swal.fire({
        html: joinContainer,
        showConfirmButton: false,
        showCloseButton: false,
        showCancelButton: false,
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la recherche de contrevenants.",
      });
    });
}

// Fonction pour gérer la jointure avec le dossier
function joinContrevenantToDossier(contrevenantId) {
  // Faire une requête AJAX pour effectuer la jointure
  fetch(
    `../pages/script/contrevenant/script_jointure_contrevenant_dossier.php?contrevenantId=${contrevenantId}&dossierId=${dossierId}`,
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
      console.log("Réponse du serveur pour la jointure :", data);

      // Traiter la réponse du serveur ici
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Contrevenant joint au dossier avec succès.",
          confirmButtonText: "OK",
        }).then(() => {
          // Actualiser la liste des contrevenants après l'ajout ou la modification
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la jointure au dossier.",
        });
      }
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la requête AJAX pour la jointure : ",
        error
      );
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la jointure au dossier.",
      });
    });
}

// Fonction pour afficher la popup avec le bouton "Joindre au dossier"
function showJoinPopup(contrevenantId) {
  const joinContainer = document.createElement("div");
  joinContainer.classList.add("popup-form");

  const joinButton = document.createElement("button");
  joinButton.innerText = "Joindre au dossier";
  joinButton.addEventListener("click", function () {
    // Appeler une fonction pour gérer la jointure
    joinContrevenantToDossier(contrevenantId);
    Swal.close();
  });

  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.addEventListener("click", function () {
    // Fermer la popup
    Swal.close();
  });

  // Ajouter les éléments à la popup
  joinContainer.appendChild(joinButton);
  joinContainer.appendChild(closeButton);

  // Afficher la popup avec le bouton "Joindre au dossier"
  Swal.fire({
    html: joinContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
  });
}
