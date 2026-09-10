document.addEventListener("DOMContentLoaded", function () {
  // Sélectionnez le bouton "Créer une entrée au Parquet"
  const btnAjouterDecisions = document.getElementById("btnAjouterDecisions");

  // Ajoutez un écouteur d'événements de clic
  btnAjouterDecisions.addEventListener("click", function () {
    // Appelez la fonction pour afficher le formulaire de création de parquet
    showPopupFormDecision();
  });

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
      const tableDecisionsBody = document.getElementById("tableDecisionsBody");

      // Effacer le contenu existant du tableau
      tableDecisionsBody.innerHTML = "";

      console.log("decisions recus", data);

      if (data.success && data.decisions && data.decisions.length > 0) {
        // Parcourir toutes les décisions récupérées
        data.decisions.forEach((decision) => {
          console.log("decisions recus", decision);
          // Créer une nouvelle ligne dans le tableau
          const newRow = tableDecisionsBody.insertRow();

          // Remplir les cellules avec les données de la décision
          const dateCell = newRow.insertCell(0);
          dateCell.innerText = decision.decision_date_decision;

          const juridictionCell = newRow.insertCell(1);
          juridictionCell.innerText = decision.decision_juridiction;

          const typeCell = newRow.insertCell(2);
          typeCell.innerText = decision.decision_type;

          const contrevenantCell = newRow.insertCell(3);
          if (decision.prenom !== null) {
            contrevenantCell.innerText = `${decision.nom} ${decision.prenom}`;
          } else {
            contrevenantCell.innerText = decision.nom;
          }

          const decisionCell = newRow.insertCell(4);
          decisionCell.innerText = decision.decision_culpabilite;

          const peineCell = newRow.insertCell(5);
          peineCell.innerText = decision.decision_peine;

          const executionProvisoireCell = newRow.insertCell(6);
          executionProvisoireCell.innerText =
            decision.decision_mode_signification;

          // Ajouter la cellule pour les actions
          const actionCell = newRow.insertCell(7);
          actionCell.classList.add("bouton-tab-cont-audience");

          // Ajouter le bouton "Modifier"
          const modifyButton = document.createElement("button");
          modifyButton.classList = "bouton-modification-audience";
          modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
          modifyButton.addEventListener("click", function () {
            // Appeler une fonction pour afficher la pop-up de modification de décision
            showDecisionPopup(decision);
          });
          actionCell.appendChild(modifyButton);

          // Ajouter le bouton "Supprimer"
          const deleteButton = document.createElement("button");
          deleteButton.classList = "bouton-suppression-audience";
          deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
          deleteButton.addEventListener("click", function () {
            // Ajouter une confirmation avant la suppression
            Swal.fire({
              title: "Confirmation",
              text: "Êtes-vous sûr de vouloir supprimer cette décision?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Oui, supprimer!",
            }).then((result) => {
              if (result.isConfirmed) {
                // Appeler une fonction pour gérer la suppression
                deleteDecision(decision.id_decision);
              }
            });
          });
          actionCell.appendChild(deleteButton);
        });
      } else {
        // Afficher un message si aucune décision n'a été trouvée
        const noDataMessage = document.createElement("tr");
        noDataMessage.innerHTML =
          '<td colspan="8">Aucune décision trouvée.</td>';
        tableDecisionsBody.appendChild(noDataMessage);
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des décisions:", error);
    });
});

function showPopupFormDecision() {
  // Créer les éléments HTML du formulaire de décision
  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "decision-form");

  // Première partie : avant le contrevenant
  const section1 = document.createElement("div");
  section1.classList.add("form-section");

  // Deuxième partie : entre le contrevenant et la publication
  const section2 = document.createElement("div");
  section2.classList.add("form-section");

  // Troisième partie : après la publication
  const section3 = document.createElement("div");
  section3.classList.add("form-section");

  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");

  // Créer le label et le champ de sélection pour les contrevenants
  const audienceLabel = document.createElement("label");
  audienceLabel.innerText = "Audience :";
  const audienceSelect = document.createElement("select");
  audienceSelect.name = "Audience";

  // Utiliser fetch pour récupérer les contrevenants depuis le script PHP
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
      // Vérifier si 'audiences' existe dans la réponse et est un tableau
      if (data && Array.isArray(data.audiences)) {
        data.audiences.forEach((audience) => {
          const option = document.createElement("option");
          option.value = audience.id_audience; // Utilisez l'identifiant de l'audience comme valeur
          option.innerText = `${audience.audience_date}  ${audience.audience_objet}`; // Affichez le nom et le prénom de l'audience
          audienceSelect.appendChild(option);
        });
      } else {
        const option = document.createElement("option");
        option.value = "";
        option.innerText = "Aucun contrevenant trouvé";
        audienceSelect.appendChild(option);
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des Audiences :", error);
      const option = document.createElement("option");
      option.value = "";
      option.innerText = "Erreur de chargement des Audiences";
      contrevenantSelect.appendChild(option);
    });

  const dateDecisionLabel = document.createElement("label");
  dateDecisionLabel.innerText = "Date décision :";
  const dateDecisionInput = document.createElement("input");
  dateDecisionInput.type = "date";
  dateDecisionInput.name = "date_decision";


  //peut être un requete pour parcourir tous les parquets existans dans la bd
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
    option.value = optionText.toLowerCase().replace(" ", "_");
    option.text = optionText;
    juridictionInput.appendChild(option);
  });

  const typeLabel = document.createElement("label");
  typeLabel.innerText = "Type :";
  const typeInput = document.createElement("select");
  typeInput.name = "type";
  typeInput.id = "type";
  const typeOptions = ["Jugement", "Arrêt", "Ordonnance"];
  typeOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText.toLowerCase().replace(" ", "_");
    option.text = optionText;
    typeInput.appendChild(option);
  });

  // Créer le label et le champ de sélection pour les contrevenants
  const contrevenantLabel = document.createElement("label");
  contrevenantLabel.innerText = "Contrevenant :";
  const contrevenantSelect = document.createElement("select");
  contrevenantSelect.name = "contrevenant";

  // Utiliser fetch pour récupérer les contrevenants depuis le script PHP
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
      // Vérifier si 'contrevenants' existe dans la réponse et est un tableau
      if (data && Array.isArray(data.contrevenants)) {
        data.contrevenants.forEach((contrevenant) => {
          const option = document.createElement("option");
          option.value = contrevenant.id_contrevenant; // Utilisez l'identifiant du contrevenant comme valeur
          const prenom = contrevenant.prenom ? contrevenant.prenom : ""; // Vérifiez si le prénom existe
          option.innerText = `${contrevenant.nom} ${prenom}`.trim(); // Affichez le nom et le prénom si disponible
          contrevenantSelect.appendChild(option);
        });
      } else {
        const option = document.createElement("option");
        option.value = "";
        option.innerText = "Aucun contrevenant trouvé";
        contrevenantSelect.appendChild(option);
      }
    })
    .catch((error) => {
      console.error(
        "Erreur lors de la récupération des contrevenants :",
        error
      );
      const option = document.createElement("option");
      option.value = "";
      option.innerText = "Erreur de chargement des contrevenants";
      contrevenantSelect.appendChild(option);
    });

  // Checkbox pour désistement, irrecevabilité, prescription
  const desistementCheckbox = document.createElement("input");
  desistementCheckbox.type = "checkbox";
  desistementCheckbox.name = "desistement_irrecevabilite_prescription";
  desistementCheckbox.id = "desistement_irrecevabilite_prescription";
  const desistementLabel = document.createElement("label");
  desistementLabel.innerText = "Désistement / Irrecevabilité / Prescription";

  // Gérer l'état des champs en fonction de la case à cocher
  desistementCheckbox.addEventListener("change", function () {
    const disabled = desistementCheckbox.checked;
    culpabiliteInput.disabled = disabled;
    peineInput.disabled = disabled;
    amendeCheckbox.disabled = disabled;
    montantSursisAmendeInput.disabled = disabled;
    montantSursisPrisonInput.disabled = disabled;
    condamnationSolidaireCheckbox.disabled = disabled;
    peineEmprisonnementInput.disabled = disabled;
    remiseEnEtatCheckbox.disabled = disabled;
    delaiInput.disabled = disabled;
    montantAstreinteInput.disabled = disabled;
    publicationCheckbox.disabled = disabled;
    dispensePeineCheckbox.disabled = disabled;
  });

  const culpabiliteLabel = document.createElement("label");
  culpabiliteLabel.innerText = "Culpabilité :";
  const culpabiliteInput = document.createElement("select");
  culpabiliteInput.name = "culpabilite";
  culpabiliteInput.id = "culpabilite";
  const defaultOption = document.createElement("option");
  defaultOption.text = ""; // Texte informatif
  defaultOption.disabled = true; // Désactiver l'option vide
  defaultOption.selected = true; // Sélectionnez l'option vide par défaut
  culpabiliteInput.appendChild(defaultOption);
  const culpabiliteOptions = ["Condamnation", "Relaxe"];
  culpabiliteOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText.toLowerCase().replace(" ", "_");
    option.text = optionText;
    culpabiliteInput.appendChild(option);
  });

  // Gérer l'état des champs en fonction du choix de la culpabilité
  culpabiliteInput.addEventListener("change", function () {
    const relaxeSelected = culpabiliteInput.value === "relaxe";
    peineInput.disabled = relaxeSelected || dispensePeineCheckbox.checked;
    dispensePeineCheckbox.disabled = relaxeSelected;
    if (relaxeSelected) {
      // Si relaxe est sélectionné, verrouillez tous les autres champs
      disableAllFields();
    }
  });

  // Champ pour la peine
  const peineLabel = document.createElement("label");
  peineLabel.innerText = "Peine :";
  const peineInput = document.createElement("input");
  peineInput.type = "checkbox";
  peineInput.name = "peine";
  peineInput.id = "peine";

  // Champ pour la dispense de peine
  const dispensePeineLabel = document.createElement("label");
  dispensePeineLabel.innerText = "Dispense de peine :";
  const dispensePeineCheckbox = document.createElement("input");
  dispensePeineCheckbox.type = "checkbox";
  dispensePeineCheckbox.name = "dispense_peine";
  dispensePeineCheckbox.id = "dispense_peine";
  dispensePeineCheckbox.disabled = true;

  // Gérer l'état du champ de dispense de peine en fonction de la culpabilité sélectionnée
  culpabiliteInput.addEventListener("change", function () {
    dispensePeineCheckbox.disabled = culpabiliteInput.value !== "condamnation";
  });

  // Gérer l'état des champs Peine et Dispense de peine pour qu'un seul puisse être sélectionné
  peineInput.addEventListener("change", function () {
    if (peineInput.checked) {
      dispensePeineCheckbox.checked = false;
    }
  });

  dispensePeineCheckbox.addEventListener("change", function () {
    if (dispensePeineCheckbox.checked) {
      peineInput.checked = false;
      // Si dispense de peine est sélectionné, verrouillez tous les autres champs
      disableAllFields();
    } else {
      // Si dispense de peine est désélectionné, réactivez les champs
      enableAllFields();
    }
  });

  // Champ pour l'observation
  const observationLabel = document.createElement("label");
  observationLabel.innerText = "Observation :";
  const observationInput = document.createElement("textarea");
  observationInput.name = "observation";

  // Champ pour l'amende
  const amendeLabel = document.createElement("label");
  amendeLabel.innerText = "Amende :";
  const amendeCheckbox = document.createElement("input");
  amendeCheckbox.type = "checkbox";
  amendeCheckbox.name = "amende";
  amendeCheckbox.id = "amende";
  amendeCheckbox.disabled = true;

  // Champ pour la décision réceptionnée à la DDTM
  const decisionReceptionneeLabel = document.createElement("label");
  decisionReceptionneeLabel.innerText = "Décision réceptionnée à la DDTM :";
  const decisionReceptionneeCheckbox = document.createElement("input");
  decisionReceptionneeCheckbox.type = "checkbox";
  decisionReceptionneeCheckbox.name = "decision_receptionnee_ddtm";

  // Champ pour le montant de l'amende
  const montantAmendeLabel = document.createElement("label");
  montantAmendeLabel.innerText = "Montant de l'amende (€):";
  const montantAmendeInput = document.createElement("input");
  montantAmendeInput.type = "text";
  montantAmendeInput.name = "montant_amende";
  montantAmendeInput.disabled = true;

  // Champ pour le sursis de l'amende
  const sursisAmendeLabel = document.createElement("label");
  sursisAmendeLabel.innerText = "Sursis de l'amende :";
  const sursisAmendeCheckbox = document.createElement("input");
  sursisAmendeCheckbox.type = "checkbox";
  sursisAmendeCheckbox.name = "sursis_amende";
  sursisAmendeCheckbox.id = "sursis_amende";
  sursisAmendeCheckbox.disabled = true;

  // Champ pour le montant du sursis de l'amende
  const montantSursisAmendeLabel = document.createElement("label");
  montantSursisAmendeLabel.innerText = "Montant du sursis de l'amende (€):";
  const montantSursisAmendeInput = document.createElement("input");
  montantSursisAmendeInput.type = "text";
  montantSursisAmendeInput.name = "montant_sursis_amende";

  // Gérer l'état du champ de montant de l'amende en fonction de la case à cocher "Sursis de l'amende"
  sursisAmendeCheckbox.addEventListener("change", function () {
    montantAmendeInput.disabled = sursisAmendeCheckbox.checked;
  });

  // Écouteur d'événements pour afficher le champ du montant de l'amende si la case est cochée
  amendeCheckbox.addEventListener("change", function () {
    montantAmendeInput.disabled = !amendeCheckbox.checked;
  });

  // Champ pour le peine d'emprisonnement
  const peineEmprisonnementLabel = document.createElement("label");
  peineEmprisonnementLabel.innerText = "Peine d'emprisonnement (en mois):";
  const peineEmprisonnementInput = document.createElement("input");
  peineEmprisonnementInput.type = "text";
  peineEmprisonnementInput.name = "peine_emprisonnement";
  peineEmprisonnementInput.disabled = true;

  // Champ pour le sursis de la peine d'emprisonnement
  const sursisLabel = document.createElement("label");
  sursisLabel.innerText = "Sursis :";
  const sursisCheckbox = document.createElement("input");
  sursisCheckbox.type = "checkbox";
  sursisCheckbox.name = "sursis";
  sursisCheckbox.id = "sursis";
  sursisCheckbox.disabled = true;

  // Champ pour le montant du sursis de prison
  const montantSursisPrisonLabel = document.createElement("label");
  montantSursisPrisonLabel.innerText = "Montant du sursis de prison (en mois):";
  const montantSursisPrisonInput = document.createElement("input");
  montantSursisPrisonInput.type = "text";
  montantSursisPrisonInput.name = "montant_sursis_prison";

  // Champ pour la remise en état
  const remiseEnEtatLabel = document.createElement("label");
  remiseEnEtatLabel.innerText = "Remise en état :";
  const remiseEnEtatCheckbox = document.createElement("input");
  remiseEnEtatCheckbox.type = "checkbox";
  remiseEnEtatCheckbox.name = "remise_en_etat";
  remiseEnEtatCheckbox.id = "remise_en_etat";
  remiseEnEtatCheckbox.disabled = true;

  // Champ pour le délai
  const delaiLabel = document.createElement("label");
  delaiLabel.innerText = "Délai :";
  const delaiInput = document.createElement("input");
  delaiInput.type = "text";
  delaiInput.name = "delai";
  delaiInput.disabled = true;

  // Champ pour le montant de l'astreinte
  const montantAstreinteLabel = document.createElement("label");
  montantAstreinteLabel.innerText = "Montant de l'astreinte (€):";
  const montantAstreinteInput = document.createElement("input");
  montantAstreinteInput.type = "text";
  montantAstreinteInput.name = "montant_astreinte";
  montantAstreinteInput.disabled = true;

  // Champ pour la publication
  const publicationLabel = document.createElement("label");
  publicationLabel.innerText = "Publication / Affichage :";
  const publicationCheckbox = document.createElement("input");
  publicationCheckbox.type = "checkbox";
  publicationCheckbox.name = "publication";
  publicationCheckbox.id = "publication";
  publicationCheckbox.disabled = true;

  // Checkbox pour condamnation solidaire
  const condamnationSolidaireCheckbox = document.createElement("input");
  condamnationSolidaireCheckbox.type = "checkbox";
  condamnationSolidaireCheckbox.name = "condamnation_solidaire";
  const condamnationSolidaireLabel = document.createElement("label");
  condamnationSolidaireLabel.innerText = "Condamnation solidaire";

  // Champ pour la qualification du jugement
  const qualificationLabel = document.createElement("label");
  qualificationLabel.innerText = "Qualification du jugement :";
  const qualificationInput = document.createElement("select");
  qualificationInput.name = "qualification_jugement";
  const qualificationOptions = [
    "Contradictoire",
    "Contradictoire à signifier",
    "Défaut",
  ];
  qualificationOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText.toLowerCase().replace(" ", "_");
    option.text = optionText;
    qualificationInput.appendChild(option);
  });

  // Champ pour le mode de signification
  const modeSignificationLabel = document.createElement("label");
  modeSignificationLabel.innerText = "Mode de signification :";
  const modeSignificationInput = document.createElement("select");
  modeSignificationInput.name = "mode_signification";
  const modeSignificationOptions = [
    "À personne",
    "À domicile",
    "À étude",
    "À parquet",
  ];
  modeSignificationOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText.toLowerCase().replace(" ", "_");
    option.text = optionText;
    modeSignificationInput.appendChild(option);
  });

  // Champ pour la date de signification
  const dateSignificationLabel = document.createElement("label");
  dateSignificationLabel.innerText = "Date de signification :";
  const dateSignificationInput = document.createElement("input");
  dateSignificationInput.type = "date";
  dateSignificationInput.name = "date_signification";

  // Champ pour la date de notification
  const dateNotificationLabel = document.createElement("label");
  dateNotificationLabel.innerText = "Date de notification :";
  const dateNotificationInput = document.createElement("input");
  dateNotificationInput.type = "date";
  dateNotificationInput.name = "date_notification";

  // Créer les champs du formulaire d'audience
  const titre_decision = document.createElement("h1");
  titre_decision.innerText = "Décisions";
  titre_decision.id = "titre_decision";

  // Ajouter les champs au formulaire
  section1.appendChild(titre_decision);
  section1.appendChild(audienceLabel);
  section1.appendChild(audienceSelect);
  section1.appendChild(dateDecisionLabel);
  section1.appendChild(dateDecisionInput);
  section1.appendChild(juridictionLabel);
  section1.appendChild(juridictionInput);
  section1.appendChild(typeLabel);
  section1.appendChild(typeInput);
  section1.appendChild(contrevenantLabel);
  section1.appendChild(contrevenantSelect);
  section2.appendChild(desistementLabel);
  section2.appendChild(desistementCheckbox);
  section2.appendChild(culpabiliteLabel);
  section2.appendChild(culpabiliteInput);
  section2.appendChild(peineLabel);
  section2.appendChild(peineInput);
  section2.appendChild(dispensePeineLabel);
  section2.appendChild(dispensePeineCheckbox);
  section2.appendChild(amendeLabel);
  section2.appendChild(amendeCheckbox);
  section2.appendChild(montantAmendeLabel);
  section2.appendChild(montantAmendeInput);
  section2.appendChild(sursisAmendeLabel);
  section2.appendChild(sursisAmendeCheckbox);
  section2.appendChild(montantSursisAmendeLabel);
  section2.appendChild(montantSursisAmendeInput);
  section2.appendChild(peineEmprisonnementLabel);
  section2.appendChild(peineEmprisonnementInput);
  section2.appendChild(sursisLabel);
  section2.appendChild(sursisCheckbox);
  section2.appendChild(montantSursisPrisonLabel);
  section2.appendChild(montantSursisPrisonInput);
  section2.appendChild(remiseEnEtatLabel);
  section2.appendChild(remiseEnEtatCheckbox);
  section2.appendChild(delaiLabel);
  section2.appendChild(delaiInput);
  section2.appendChild(montantAstreinteLabel);
  section2.appendChild(montantAstreinteInput);
  section2.appendChild(condamnationSolidaireLabel);
  section2.appendChild(condamnationSolidaireCheckbox);
  section2.appendChild(publicationLabel);
  section2.appendChild(publicationCheckbox);
  section3.appendChild(decisionReceptionneeLabel);
  section3.appendChild(decisionReceptionneeCheckbox);
  section3.appendChild(qualificationLabel);
  section3.appendChild(qualificationInput);
  section3.appendChild(modeSignificationLabel);
  section3.appendChild(modeSignificationInput);
  section3.appendChild(dateSignificationLabel);
  section3.appendChild(dateSignificationInput);
  section3.appendChild(dateNotificationLabel);
  section3.appendChild(dateNotificationInput);
  section3.appendChild(observationLabel);
  section3.appendChild(observationInput);

  // Ajoutez les sections au formulaire
  formContainer.appendChild(section1);
  formContainer.appendChild(document.createElement("hr")); // Barre de séparation
  formContainer.appendChild(section2);
  formContainer.appendChild(document.createElement("hr")); // Barre de séparation
  formContainer.appendChild(section3);

  // Ajouter les écouteurs d'événements pour gérer l'état des champs en fonction de la case à cocher "Peine"
  peineInput.addEventListener("change", function () {
    const disabled = !peineInput.checked;
    amendeCheckbox.disabled = disabled;
    peineEmprisonnementInput.disabled = disabled;
    sursisCheckbox.disabled = disabled;
    remiseEnEtatCheckbox.disabled = disabled;
    delaiInput.disabled = disabled;
    montantAstreinteInput.disabled = disabled;
    publicationCheckbox.disabled = disabled;
    dispensePeineCheckbox.disabled = disabled;
  });
  // Créer et ajouter les boutons "Soumettre" et "Fermer"
  const submitButton = document.createElement("button");
  submitButton.innerText = "Soumettre";
  submitButton.addEventListener("click", function () {
    // Créer un objet représentant les données du formulaire
    const formData = new FormData();

    // Ajout de chaque champ du formulaire à l'instance de FormData
    formData.append("audience", audienceSelect.value);
    formData.append("contrevenant", contrevenantSelect.value);
    formData.append("date_decision", dateDecisionInput.value);
    formData.append("juridiction", juridictionInput.value);
    formData.append("type", typeInput.value);
    formData.append(
      "desistement_irrecevabilite_prescription",
      desistementCheckbox.checked
    );
    formData.append("culpabilite", culpabiliteInput.value);
    formData.append("peine", peineInput.checked);
    formData.append("dispense_peine", dispensePeineCheckbox.checked);
    formData.append("montant_amende", montantAmendeInput.value);
    formData.append("sursis_amende", sursisAmendeCheckbox.checked);
    formData.append("montant_sursis_amende", montantSursisAmendeInput.value);
    formData.append("peine_emprisonnement", peineEmprisonnementInput.value);
    formData.append("sursis", sursisCheckbox.checked);
    formData.append("montant_sursis_prison", montantSursisPrisonInput.value);
    formData.append("remise_en_etat", remiseEnEtatCheckbox.checked);
    formData.append("delai", delaiInput.value);
    formData.append("montant_astreinte", montantAstreinteInput.value);
    formData.append(
      "condamnation_solidaire",
      condamnationSolidaireCheckbox.checked
    );
    formData.append("publication", publicationCheckbox.checked);
    formData.append("reception", decisionReceptionneeCheckbox.checked);
    formData.append("qualification_jugement", qualificationInput.value);
    formData.append("mode_signification", modeSignificationInput.value);
    formData.append("date_signification", dateSignificationInput.value);
    formData.append("date_notification", dateNotificationInput.value);
    formData.append("observation", observationInput.value);

    // Afficher les données du formulaire dans la console
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    // Envoyer les données du formulaire au script de création d'une entité décision
    fetch("../pages/script/decision/script_creation_decision.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Succès",
            text: "Entité décision créée avec succès !",
          }).then(() => {
            Swal.close();
            // Actualiser la liste des décisions après l'ajout ou la modification
            location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text:
              data.error ||
              "Une erreur s'est produite lors de la création de l'entité décision.",
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
  });

  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.addEventListener("click", function () {
    Swal.close();
  });

  formContainer.appendChild(submitButton);
  formContainer.appendChild(closeButton);

  // Afficher la popup avec le formulaire de décision
  Swal.fire({
    html: formContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
    didOpen: () => {
      // Ajouter une classe personnalisée au conteneur de la fenêtre modale
      const modalContainer = Swal.getPopup();
      if (modalContainer) {
        modalContainer.classList.add("decision-popup-cont");
      }
    },
  });

  // Fonction pour verrouiller tous les champs
  function disableAllFields() {
    amendeCheckbox.disabled = true;
    montantAmendeInput.disabled = true;
    sursisAmendeCheckbox.disabled = true;
    peineEmprisonnementInput.disabled = true;
    sursisCheckbox.disabled = true;
    remiseEnEtatCheckbox.disabled = true;
    montantSursisAmendeInput.disabled = true;
    montantSursisPrisonInput.disabled = true;
    condamnationSolidaireCheckbox.disabled = true;
    delaiInput.disabled = true;

    montantAstreinteInput.disabled = true;
    publicationCheckbox.disabled = true;
  }

  // Fonction pour réactiver tous les champs
  function enableAllFields() {
    amendeCheckbox.disabled = false;
    montantAmendeInput.disabled = !amendeCheckbox.checked;
    sursisAmendeCheckbox.disabled = false;
    peineEmprisonnementInput.disabled = false;
    sursisCheckbox.disabled = false;
    remiseEnEtatCheckbox.disabled = false;
    montantSursisAmendeInput.disabled = false;
    montantSursisPrisonInput.disabled = false;
    condamnationSolidaireCheckbox.disabled = false;
    delaiInput.disabled = false;
    montantAstreinteInput.disabled = false;
    publicationCheckbox.disabled = false;
  }
}

function deleteDecision(decisionId) {
  fetch(
    `../pages/script/decision/script_supprimer_decision.php?id=${decisionId}`,
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


function showDecisionPopup(decisionData){
  console.log("decision envoyé dans le form pour modifier : ",decisionData);
  //console.log("nom contrevenant : ",decisionData.nom);
  // Créer les éléments HTML du formulaire de décision
  const formContainer = document.createElement("div");
  formContainer.classList.add("popup-form", "decision-form");

  // Première partie : avant le contrevenant
  const section1 = document.createElement("div");
  section1.classList.add("form-section");

  // Deuxième partie : entre le contrevenant et la publication
  const section2 = document.createElement("div");
  section2.classList.add("form-section");

  // Troisième partie : après la publication
  const section3 = document.createElement("div");
  section3.classList.add("form-section");

  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");

  // Créer le label et le champ de sélection pour les audiences
  const audienceLabel = document.createElement("label");
  audienceLabel.innerText = "Audience :";
  const audienceSelect = document.createElement("select");
  audienceSelect.name = "Audience";
  
  // Variable contenant l'ID de l'audience par défaut
  const defaultAudienceId = decisionData.id_audience;  // Utilisez l'ID de l'audience par défaut depuis decisionData
  console.log("di_audience à modifier : ",decisionData.id_audience);
  // Utiliser fetch pour récupérer les audiences depuis le script PHP
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
      // Vérifier si 'audiences' existe dans la réponse et est un tableau
      if (data && Array.isArray(data.audiences)) {
        data.audiences.forEach((audience) => {
          const option = document.createElement("option");
          option.value = audience.id_audience; // Utilisez l'identifiant de l'audience comme valeur
          option.innerText = `${audience.audience_date} ${audience.audience_objet}`; // Affichez la date et la juridiction de l'audience
          //préremplissage :
          if (audience.id_audience === defaultAudienceId) {
            option.selected = true; // Sélectionner cette option par défaut
          }
          audienceSelect.appendChild(option);
        });
        //console.log("liste des audiences : ", data.audiences);
        //console.log("id audience par le fetch : ", data.audiences.map(a => a.id_audience));
      } else {
        const option = document.createElement("option");
        option.value = "";
        option.innerText = "Aucune audience trouvée";
        audienceSelect.appendChild(option);
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des Audiences :", error);
      const option = document.createElement("option");
      option.value = "";
      option.innerText = "Erreur de chargement des Audiences";
      audienceSelect.appendChild(option);
    });


  const dateDecisionLabel = document.createElement("label");
  dateDecisionLabel.innerText = "Date décision :";
  const dateDecisionInput = document.createElement("input");
  dateDecisionInput.type = "date";
  dateDecisionInput.name = "date_decision";
  //préremplissage :
  dateDecisionInput.value = decisionData.decision_date_decision;


// Champ pour la juridiction
const juridictionLabel = document.createElement("label");
juridictionLabel.innerText = "Juridiction :";
const juridictionInput = document.createElement("select");
juridictionInput.name = "juridiction";
juridictionInput.id = "juridiction";

// Options de juridiction
const juridictionOptions = [
  "TJ Montpellier",
  "TJ Béziers",
  "CA Montpellier",
  "Cours de cassation",
  "Autre juridiction",
];

juridictionOptions.forEach((optionText) => {
  const option = document.createElement("option");
  option.value = optionText.toLowerCase().replace(/ /g, "_");
  option.text = optionText;

  // Définir la valeur par défaut si elle correspond à decisionData.decision_juridiction
  if (option.value === decisionData.decision_juridiction.toLowerCase().replace(/ /g, "_")) {
    option.selected = true; // Sélectionner cette option par défaut
  }

  juridictionInput.appendChild(option);
});


  const defaultType = decisionData.decision_type;
//console.log("type issu de la requête : ", defaultType);

const typeLabel = document.createElement("label");
typeLabel.innerText = "Type :";
const typeInput = document.createElement("select");
typeInput.name = "type";
typeInput.id = "type";

const typeOptions = ["Jugement", "Arrêt", "Ordonnance"];
typeOptions.forEach((optionText) => {
  const option = document.createElement("option");
  option.value = optionText.toLowerCase().replace(" ", "_");
  option.text = optionText;
  //console.log("option type : ", optionText);
  //préremplissage :
  // Comparaison insensible à la casse
  if (optionText.toLowerCase() === defaultType.toLowerCase()) {
    option.selected = true; // Sélectionner cette option par défaut
  }

  typeInput.appendChild(option);
});





const contrevenantContainer = document.createElement("div");
contrevenantContainer.id = "contrevenant-container";
formContainer.appendChild(contrevenantContainer);

const selectedContrevenants = new Set();

const createContrevenantField = () => {
    const contrevenantSelect = document.createElement("select");
    contrevenantSelect.name = "contrevenant";

    fetch(`../pages/script/contrevenant/script_details_contrevenant.php?id=${dossierId}`, {
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
        if (data && Array.isArray(data.contrevenants)) {
            data.contrevenants.forEach((contrevenant) => {
                const option = document.createElement("option");
                option.value = contrevenant.id_contrevenant;
                let nomComplet = "";
                if (contrevenant.nom) {
                    nomComplet += contrevenant.nom;
                }
                if (contrevenant.prenom) {
                    if (nomComplet) {
                        nomComplet += " ";
                    }
                    nomComplet += contrevenant.prenom;
                }
                option.innerText = nomComplet;
                contrevenantSelect.appendChild(option);
            });
        } else {
            const option = document.createElement("option");
            option.value = "";
            option.innerText = "Aucun contrevenant trouvé";
            contrevenantSelect.appendChild(option);
        }
    })
    .catch((error) => {
        console.error("Erreur lors de la récupération des contrevenants :", error);
        const option = document.createElement("option");
        option.value = "";
        option.innerText = "Erreur de chargement des contrevenants";
        contrevenantSelect.appendChild(option);
    });

    const contrevenantFieldContainer = document.createElement("div");
    contrevenantFieldContainer.classList.add("contrevenant-field-container");
    contrevenantFieldContainer.appendChild(contrevenantSelect);

    const removeContrevenantButton = document.createElement("button");
    removeContrevenantButton.innerText = "Supprimer Contrevenant";
    removeContrevenantButton.type = "button";
    removeContrevenantButton.addEventListener("click", () => {
        const selectedValue = contrevenantSelect.value;
        contrevenantContainer.removeChild(contrevenantFieldContainer);
        selectedContrevenants.delete(selectedValue);
    });
    contrevenantFieldContainer.appendChild(removeContrevenantButton);

    contrevenantContainer.appendChild(contrevenantFieldContainer);

    contrevenantSelect.addEventListener("change", (event) => {
        const selectedValue = event.target.value;
        if (selectedContrevenants.has(selectedValue)) {
            alert("Ce contrevenant est déjà sélectionné.");
            contrevenantSelect.value = "";
        } else {
            selectedContrevenants.add(selectedValue);
        }
    });
};

const addContrevenantButton = document.createElement("button");
addContrevenantButton.innerText = "Ajouter Contrevenant";
addContrevenantButton.type = "button";
addContrevenantButton.addEventListener("click", createContrevenantField);

  // Checkbox pour désistement, irrecevabilité, prescription
const desistementCheckbox = document.createElement("input");
desistementCheckbox.type = "checkbox";
desistementCheckbox.name = "desistement_irrecevabilite_prescription";
desistementCheckbox.id = "desistement_irrecevabilite_prescription";
const desistementLabel = document.createElement("label");
desistementLabel.htmlFor = "desistement_irrecevabilite_prescription";
desistementLabel.innerText = "Désistement / Irrecevabilité / Prescription";

// Définir l'état coché en fonction de decision_peine
if (decisionData.decision_peine === '0') {
  desistementCheckbox.checked = true; // Cocher la checkbox
} else {
  desistementCheckbox.checked = false; // Ne pas cocher la checkbox
}



  // Gérer l'état des champs en fonction de la case à cocher
  desistementCheckbox.addEventListener("change", function () {
    const disabled = desistementCheckbox.checked;
    culpabiliteInput.disabled = disabled;
    peineInput.disabled = disabled;
    amendeCheckbox.disabled = disabled;
    montantSursisAmendeInput.disabled = disabled;
    montantSursisPrisonInput.disabled = disabled;
    condamnationSolidaireCheckbox.disabled = disabled;
    peineEmprisonnementInput.disabled = disabled;
    remiseEnEtatCheckbox.disabled = disabled;
    delaiInput.disabled = disabled;
    montantAstreinteInput.disabled = disabled;
    publicationCheckbox.disabled = disabled;
    dispensePeineCheckbox.disabled = disabled;
  });

  const culpabiliteLabel = document.createElement("label");
  culpabiliteLabel.innerText = "Culpabilité :";
  const culpabiliteInput = document.createElement("select");
  culpabiliteInput.name = "culpabilite";
  culpabiliteInput.id = "culpabilite";
  const defaultOption = document.createElement("option");
  defaultOption.text = ""; // Texte informatif
  defaultOption.disabled = true; // Désactiver l'option vide
  defaultOption.selected = true; // Sélectionnez l'option vide par défaut
  culpabiliteInput.appendChild(defaultOption);
  const culpabiliteOptions = ["Condamnation", "Relaxe"];
  culpabiliteOptions.forEach((optionText) => {
    const option = document.createElement("option");
    option.value = optionText.toLowerCase().replace(" ", "_");
    option.text = optionText;
    culpabiliteInput.appendChild(option);
  });
  //préremplissage :
  culpabiliteInput.value = decisionData.decision_culpabilite;

  // Gérer l'état des champs en fonction du choix de la culpabilité
  culpabiliteInput.addEventListener("change", function () {
    const relaxeSelected = culpabiliteInput.value === "relaxe";
    peineInput.disabled = relaxeSelected || dispensePeineCheckbox.checked;
    dispensePeineCheckbox.disabled = relaxeSelected;
    if (relaxeSelected) {
      // Si relaxe est sélectionné, verrouillez tous les autres champs
      disableAllFields();
    }
  });

  // Champ pour la peine
  const peineLabel = document.createElement("label");
  peineLabel.innerText = "Peine :";
  const peineInput = document.createElement("input");
  peineInput.type = "checkbox";
  peineInput.name = "peine";
  peineInput.id = "peine";
  //préremplissage :
  // Définir l'état coché en fonction de decision_peine
if (decisionData.decision_peine === '1') {
  peineInput.checked = true; // Cocher la checkbox
} else {
  peineInput.checked = false; // Ne pas cocher la checkbox
}

  // Champ pour la dispense de peine
  const dispensePeineLabel = document.createElement("label");
  dispensePeineLabel.innerText = "Dispense de peine :";
  const dispensePeineCheckbox = document.createElement("input");
  dispensePeineCheckbox.type = "checkbox";
  dispensePeineCheckbox.name = "dispense_peine";
  dispensePeineCheckbox.id = "dispense_peine";
  dispensePeineCheckbox.disabled = true;
//préremplissage :
  // si y'a pas de peine y'a dispense de peine ???
  if (decisionData.decision_peine === "1"){
    dispensePeineCheckbox.checked = false;
  }else {
    dispensePeineCheckbox.checked = true;
  }

  // Gérer l'état du champ de dispense de peine en fonction de la culpabilité sélectionnée
  culpabiliteInput.addEventListener("change", function () {
    dispensePeineCheckbox.disabled = culpabiliteInput.value !== "condamnation";
  });

  // Gérer l'état des champs Peine et Dispense de peine pour qu'un seul puisse être sélectionné
  peineInput.addEventListener("change", function () {
    if (peineInput.checked) {
      dispensePeineCheckbox.checked = false;
    }
  });

  dispensePeineCheckbox.addEventListener("change", function () {
    if (dispensePeineCheckbox.checked) {
      peineInput.checked = false;
      // Si dispense de peine est sélectionné, verrouillez tous les autres champs
      disableAllFields();
    } else {
      // Si dispense de peine est désélectionné, réactivez les champs
      enableAllFields();
    }
  });

  // Champ pour l'observation
  const observationLabel = document.createElement("label");
  observationLabel.innerText = "Observation :";
  const observationInput = document.createElement("textarea");
  observationInput.name = "observation";
  //préremplissage :
  observationInput.value = decisionData.decision_observation;

  // Champ pour l'amende
  const amendeLabel = document.createElement("label");
  amendeLabel.innerText = "Amende :";
  const amendeCheckbox = document.createElement("input");
  amendeCheckbox.type = "checkbox";
  amendeCheckbox.name = "amende";
  amendeCheckbox.id = "amende";
  amendeCheckbox.disabled = true;
  //préremplissage :
  if (decisionData.decision_amende != null){
    amendeCheckbox.checked = true;
  }else{
    amendeCheckbox.checked = false;
  }

  // Champ pour la décision réceptionnée à la DDTM
  const decisionReceptionneeLabel = document.createElement("label");
  decisionReceptionneeLabel.innerText = "Décision réceptionnée à la DDTM :";
  const decisionReceptionneeCheckbox = document.createElement("input");
  decisionReceptionneeCheckbox.type = "checkbox";
  decisionReceptionneeCheckbox.name = "decision_receptionnee_ddtm";
  //préremplissage :
  if (decisionData.decision_decision_receptionnee === "1"){
    decisionReceptionneeCheckbox.checked = true;
  }
  else{
    decisionReceptionneeCheckbox.checked = false;
  }

  // Champ pour le montant de l'amende
  const montantAmendeLabel = document.createElement("label");
  montantAmendeLabel.innerText = "Montant de l'amende (€):";
  const montantAmendeInput = document.createElement("input");
  montantAmendeInput.type = "text";
  montantAmendeInput.name = "montant_amende";
  montantAmendeInput.disabled = true;
  //préremplissage :
  montantAmendeInput.value = decisionData.decision_amende;

  // Champ pour le sursis de l'amende
  const sursisAmendeLabel = document.createElement("label");
  sursisAmendeLabel.innerText = "Sursis de l'amende :";
  const sursisAmendeCheckbox = document.createElement("input");
  sursisAmendeCheckbox.type = "checkbox";
  sursisAmendeCheckbox.name = "sursis_amende";
  sursisAmendeCheckbox.id = "sursis_amende";
  sursisAmendeCheckbox.disabled = true;
  //préremplissage :
  if(decisionData.decision_sursis_amende != ""){
    sursisAmendeCheckbox.checked = true;
  } else{
    sursisAmendeCheckbox.checked = false;
  }

  // Champ pour le montant du sursis de l'amende
  const montantSursisAmendeLabel = document.createElement("label");
  montantSursisAmendeLabel.innerText = "Montant du sursis de l'amende (€):";
  const montantSursisAmendeInput = document.createElement("input");
  montantSursisAmendeInput.type = "text";
  montantSursisAmendeInput.name = "montant_sursis_amende";
  //préremplissage :
  montantSursisAmendeInput.value = decisionData.decision_sursis_amende;

  // Gérer l'état du champ de montant de l'amende en fonction de la case à cocher "Sursis de l'amende"
  sursisAmendeCheckbox.addEventListener("change", function () {
    montantAmendeInput.disabled = sursisAmendeCheckbox.checked;
  });

  // Écouteur d'événements pour afficher le champ du montant de l'amende si la case est cochée
  amendeCheckbox.addEventListener("change", function () {
    montantAmendeInput.disabled = !amendeCheckbox.checked;
  });

  // Champ pour le peine d'emprisonnement
  const peineEmprisonnementLabel = document.createElement("label");
  peineEmprisonnementLabel.innerText = "Peine d'emprisonnement (en mois):";
  const peineEmprisonnementInput = document.createElement("input");
  peineEmprisonnementInput.type = "text";
  peineEmprisonnementInput.name = "peine_emprisonnement";
  peineEmprisonnementInput.disabled = true;
  //préremplissage :
  peineEmprisonnementInput.value = decisionData.decision_peine_prison;

  // Champ pour le sursis de la peine d'emprisonnement
  const sursisLabel = document.createElement("label");
  sursisLabel.innerText = "Sursis :";
  const sursisCheckbox = document.createElement("input");
  sursisCheckbox.type = "checkbox";
  sursisCheckbox.name = "sursis";
  sursisCheckbox.id = "sursis";
  sursisCheckbox.disabled = true;
  //préremplissage :
  if(decisionData.decision_sursis_prison != ""){
    sursisCheckbox.checked = true;
  }else{
    sursisCheckbox.checked =false;
  }

  // Champ pour le montant du sursis de prison
  const montantSursisPrisonLabel = document.createElement("label");
  montantSursisPrisonLabel.innerText = "Montant du sursis de prison (en mois):";
  const montantSursisPrisonInput = document.createElement("input");
  montantSursisPrisonInput.type = "text";
  montantSursisPrisonInput.name = "montant_sursis_prison";
  //préremplissage :
  montantSursisPrisonInput.value = decisionData.decision_sursis_prison;

  // Champ pour la remise en état
  const remiseEnEtatLabel = document.createElement("label");
  remiseEnEtatLabel.innerText = "Remise en état :";
  const remiseEnEtatCheckbox = document.createElement("input");
  remiseEnEtatCheckbox.type = "checkbox";
  remiseEnEtatCheckbox.name = "remise_en_etat";
  remiseEnEtatCheckbox.id = "remise_en_etat";
  remiseEnEtatCheckbox.disabled = true;
  //préremplissage :
  if(decisionData.decision_remise_etat === "1"){
    remiseEnEtatCheckbox.checked = true;
  }else{
    remiseEnEtatCheckbox.checked = false;
  }

  // Champ pour le délai
  const delaiLabel = document.createElement("label");
  delaiLabel.innerText = "Délai :";
  const delaiInput = document.createElement("input");
  delaiInput.type = "text";
  delaiInput.name = "delai";
  delaiInput.disabled = true;
  //préremplissage :
  delaiInput.value = decisionData.decision_delai;

  // Champ pour le montant de l'astreinte
  const montantAstreinteLabel = document.createElement("label");
  montantAstreinteLabel.innerText = "Montant de l'astreinte (€):";
  const montantAstreinteInput = document.createElement("input");
  montantAstreinteInput.type = "text";
  montantAstreinteInput.name = "montant_astreinte";
  montantAstreinteInput.disabled = true;
  //préremplissage :
  montantAstreinteInput.value = decisionData.decision_montant_astreinte;

  // Champ pour la publication
  const publicationLabel = document.createElement("label");
  publicationLabel.innerText = "Publication / Affichage :";
  const publicationCheckbox = document.createElement("input");
  publicationCheckbox.type = "checkbox";
  publicationCheckbox.name = "publication";
  publicationCheckbox.id = "publication";
  publicationCheckbox.disabled = true;
  //préremplissage :
  if (decisionData.decision_publication === "1"){
    publicationCheckbox.checked = true;
  }else{
    publicationCheckbox.checked = false
  }

  // Checkbox pour condamnation solidaire
  const condamnationSolidaireCheckbox = document.createElement("input");
  condamnationSolidaireCheckbox.type = "checkbox";
  condamnationSolidaireCheckbox.name = "condamnation_solidaire";
  const condamnationSolidaireLabel = document.createElement("label");
  condamnationSolidaireLabel.innerText = "Condamnation solidaire";
  //préremplissage :
  if(decisionData.decision_condamnation_solidaire === "1"){
    condamnationSolidaireCheckbox.checked = true;
  }else{
    condamnationSolidaireCheckbox.checked = false;
  }

// Champ pour la qualification du jugement
const qualificationLabel = document.createElement("label");
qualificationLabel.innerText = "Qualification du jugement :";
const qualificationInput = document.createElement("select");
qualificationInput.name = "qualification_jugement";

// Options de qualification
const qualificationOptions = [
  "Contradictoire",
  "Contradictoire à signifier",
  "Défaut",
];

qualificationOptions.forEach((optionText) => {
  const option = document.createElement("option");
  option.value = optionText.toLowerCase().replace(" ", "_");
  option.text = optionText;
  
  // Définir la valeur par défaut si elle correspond à decisionData.decision_qualification
  if (optionText.toLowerCase().replace(" ", "_") === decisionData.decision_qualification.toLowerCase()) {
    option.selected = true; // Sélectionner cette option par défaut
  }

  qualificationInput.appendChild(option);
});

// Champ pour le mode de signification
const modeSignificationLabel = document.createElement("label");
modeSignificationLabel.innerText = "Mode de signification :";
const modeSignificationInput = document.createElement("select");
modeSignificationInput.name = "mode_signification";

// Options de mode de signification
const modeSignificationOptions = [
  "À personne",
  "À domicile",
  "À étude",
  "À parquet",
];

modeSignificationOptions.forEach((optionText) => {
  const option = document.createElement("option");
  option.value = optionText.toLowerCase().replace(" ", "_");
  option.text = optionText;
  
  // Définir la valeur par défaut si elle correspond à decisionData.decision_mode_signification
  if (option.value === decisionData.decision_mode_signification.toLowerCase().replace(" ", "_")) {
    option.selected = true; // Sélectionner cette option par défaut
  }

  modeSignificationInput.appendChild(option);
});

  // Champ pour la date de signification
  const dateSignificationLabel = document.createElement("label");
  dateSignificationLabel.innerText = "Date de signification :";
  const dateSignificationInput = document.createElement("input");
  dateSignificationInput.type = "date";
  dateSignificationInput.name = "date_signification";
  dateSignificationInput.value = decisionData.decision_date_signification;

  // Champ pour la date de notification
  const dateNotificationLabel = document.createElement("label");
  dateNotificationLabel.innerText = "Date de notification :";
  const dateNotificationInput = document.createElement("input");
  dateNotificationInput.type = "date";
  dateNotificationInput.name = "date_notification";
  dateNotificationInput.value = decisionData.decision_date_notification;


  // Créer les champs du formulaire d'audience
  const titre_decision = document.createElement("h1");
  titre_decision.innerText = "Décisions";
  titre_decision.id = "titre_decision";

      // Ajouter les champs au formulaire
  section1.appendChild(audienceLabel);
  section1.appendChild(audienceSelect);
  section1.appendChild(dateDecisionLabel);
  section1.appendChild(dateDecisionInput);
  section1.appendChild(juridictionLabel);
  section1.appendChild(juridictionInput);
  section1.appendChild(typeLabel);
  section1.appendChild(typeInput);
  section1.appendChild(addContrevenantButton); // Ajouter le bouton "Ajouter Contrevenant" ici
  section1.appendChild(contrevenantContainer); // Ajouter le conteneur de contrevenant ici

  section2.appendChild(desistementLabel);
  section2.appendChild(desistementCheckbox);
  section2.appendChild(culpabiliteLabel);
  section2.appendChild(culpabiliteInput);
  section2.appendChild(peineLabel);
  section2.appendChild(peineInput);
  section2.appendChild(dispensePeineLabel);
  section2.appendChild(dispensePeineCheckbox);
  section2.appendChild(amendeLabel);
  section2.appendChild(amendeCheckbox);
  section2.appendChild(montantAmendeLabel);
  section2.appendChild(montantAmendeInput);
  section2.appendChild(sursisAmendeLabel);
  section2.appendChild(sursisAmendeCheckbox);
  section2.appendChild(montantSursisAmendeLabel);
  section2.appendChild(montantSursisAmendeInput);
  section2.appendChild(peineEmprisonnementLabel);
  section2.appendChild(peineEmprisonnementInput);
  section2.appendChild(sursisLabel);
  section2.appendChild(sursisCheckbox);
  section2.appendChild(montantSursisPrisonLabel);
  section2.appendChild(montantSursisPrisonInput);
  section2.appendChild(remiseEnEtatLabel);
  section2.appendChild(remiseEnEtatCheckbox);
  section2.appendChild(delaiLabel);
  section2.appendChild(delaiInput);
  section2.appendChild(montantAstreinteLabel);
  section2.appendChild(montantAstreinteInput);
  section2.appendChild(condamnationSolidaireLabel);
  section2.appendChild(condamnationSolidaireCheckbox);
  section2.appendChild(publicationLabel);
  section2.appendChild(publicationCheckbox);
  section3.appendChild(decisionReceptionneeLabel);
  section3.appendChild(decisionReceptionneeCheckbox);
  section3.appendChild(qualificationLabel);
  section3.appendChild(qualificationInput);
  section3.appendChild(modeSignificationLabel);
  section3.appendChild(modeSignificationInput);
  section3.appendChild(dateSignificationLabel);
  section3.appendChild(dateSignificationInput);
  section3.appendChild(dateNotificationLabel);
  section3.appendChild(dateNotificationInput);
  section3.appendChild(observationLabel);
  section3.appendChild(observationInput);

  // Ajoutez les sections au formulaire
  formContainer.appendChild(section1);
  formContainer.appendChild(document.createElement("hr")); // Barre de séparation
  formContainer.appendChild(section2);
  formContainer.appendChild(document.createElement("hr")); // Barre de séparation
  formContainer.appendChild(section3);

  // Ajouter les écouteurs d'événements pour gérer l'état des champs en fonction de la case à cocher "Peine"
  peineInput.addEventListener("change", function () {
    const disabled = !peineInput.checked;
    amendeCheckbox.disabled = disabled;
    peineEmprisonnementInput.disabled = disabled;
    sursisCheckbox.disabled = disabled;
    remiseEnEtatCheckbox.disabled = disabled;
    delaiInput.disabled = disabled;
    montantAstreinteInput.disabled = disabled;
    publicationCheckbox.disabled = disabled;
    dispensePeineCheckbox.disabled = disabled;
  });
    // Créer et ajouter les boutons "Soumettre" et "Fermer"
const submitButton = document.createElement("button");
submitButton.innerText = "Soumettre";
submitButton.addEventListener("click", function () {
  // Créer un objet représentant les données du formulaire
  const formData = new FormData();

  // Ajout de chaque champ du formulaire à l'instance de FormData
  formData.append("audience", audienceSelect.value);
  formData.append("contrevenant", contrevenantSelect.value);
  formData.append("date_decision", dateDecisionInput.value);
  formData.append("juridiction", juridictionInput.value);
  formData.append("type", typeInput.value);
  formData.append("desistement_irrecevabilite_prescription", desistementCheckbox.checked);
  formData.append("culpabilite", culpabiliteInput.value);
  formData.append("peine", peineInput.checked);
  formData.append("dispense_peine", dispensePeineCheckbox.checked);
  formData.append("montant_amende", montantAmendeInput.value);
  formData.append("sursis_amende", sursisAmendeCheckbox.checked);
  formData.append("montant_sursis_amende", montantSursisAmendeInput.value);
  formData.append("peine_emprisonnement", peineEmprisonnementInput.value);
  formData.append("sursis", sursisCheckbox.checked);
  formData.append("montant_sursis_prison", montantSursisPrisonInput.value);
  formData.append("remise_en_etat", remiseEnEtatCheckbox.checked);
  formData.append("delai", delaiInput.value);
  formData.append("montant_astreinte", montantAstreinteInput.value);
  formData.append("condamnation_solidaire", condamnationSolidaireCheckbox.checked);
  formData.append("publication", publicationCheckbox.checked);
  formData.append("reception", decisionReceptionneeCheckbox.checked);
  formData.append("qualification_jugement", qualificationInput.value);
  formData.append("mode_signification", modeSignificationInput.value);
  formData.append("date_signification", dateSignificationInput.value);
  formData.append("date_notification", dateNotificationInput.value);
  formData.append("observation", observationInput.value);

  // Afficher les données du formulaire dans la console
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  // Envoyer les données du formulaire au script de création d'une entité décision
  fetch("../pages/script/decision/script_modification_decision.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Succès",
          text: "Décision modifiée avec succès !",
        }).then(() => {
          Swal.close();
          // Actualiser la liste des décisions après l'ajout ou la modification
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text:
            data.error ||
            "Une erreur s'est produite lors de la modification de la décision.",
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
});

const closeButton = document.createElement("button");
closeButton.innerText = "Fermer";
closeButton.addEventListener("click", function () {
  Swal.close();
});
formContainer.appendChild(submitButton);
formContainer.appendChild(closeButton);

// Afficher la popup avec le formulaire de décision
Swal.fire({
  html: formContainer,
  showConfirmButton: false,
  showCloseButton: false,
  showCancelButton: false,
  didOpen: () => {
    // Ajouter une classe personnalisée au conteneur de la fenêtre modale
    const modalContainer = Swal.getPopup();
    if (modalContainer) {
      modalContainer.classList.add("decision-popup-cont");
    }
  },
});

  // Fonction pour verrouiller tous les champs
  function disableAllFields() {
    amendeCheckbox.disabled = true;
    montantAmendeInput.disabled = true;
    sursisAmendeCheckbox.disabled = true;
    peineEmprisonnementInput.disabled = true;
    sursisCheckbox.disabled = true;
    remiseEnEtatCheckbox.disabled = true;
    montantSursisAmendeInput.disabled = true;
    montantSursisPrisonInput.disabled = true;
    condamnationSolidaireCheckbox.disabled = true;
    delaiInput.disabled = true;

    montantAstreinteInput.disabled = true;
    publicationCheckbox.disabled = true;
  }

  // Fonction pour réactiver tous les champs
  function enableAllFields() {
    amendeCheckbox.disabled = false;
    montantAmendeInput.disabled = !amendeCheckbox.checked;
    sursisAmendeCheckbox.disabled = false;
    peineEmprisonnementInput.disabled = false;
    sursisCheckbox.disabled = false;
    remiseEnEtatCheckbox.disabled = false;
    montantSursisAmendeInput.disabled = false;
    montantSursisPrisonInput.disabled = false;
    condamnationSolidaireCheckbox.disabled = false;
    delaiInput.disabled = false;
    montantAstreinteInput.disabled = false;
    publicationCheckbox.disabled = false;
  }

  

}