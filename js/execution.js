document.addEventListener("DOMContentLoaded", function () {
  showExecutionReport();
});

function showExecutionReport() {
  // Créer le conteneur pour les informations
  const reportContainer = document.createElement("div");
  reportContainer.classList.add("execution-report");

  // Fonction pour créer une phrase de rapport
  function createReportSentence(
    id,
    description,
    inputElement,
    dateElement = null
  ) {
    const sentence = document.createElement("div");
    sentence.classList.add("report-sentence");

    const descriptionNode = document.createElement("span");
    descriptionNode.classList.add("report-description");
    descriptionNode.innerText = description;

    inputElement.id = `input_${id}`;
    inputElement.classList.add("report-input");

    sentence.appendChild(descriptionNode);
    sentence.appendChild(inputElement);

    if (dateElement) {
      const dateDescriptionNode = document.createElement("span");
      dateDescriptionNode.classList.add("date-description");
      dateDescriptionNode.innerText = " Date :";

      dateElement.id = `date_${id}`;
      dateElement.classList.add("report-input");

      sentence.appendChild(dateDescriptionNode);
      sentence.appendChild(dateElement);
    }

    return sentence;
  }

  // Créer les phrases de rapport
  reportContainer.appendChild(
    createReportSentence(
      "statut_execution",
      "Statut de l'exécution :",
      createSelectElement(
        ["", "en étude", "validé", "écarté"],
        "statut_execution"
      ),
      createDateElement("date_statut")
    )
  );
  reportContainer.appendChild(
    createReportSentence(
      "faisabilite_execution",
      "Rapport de faisabilité :",
      createSelectElement(["", "demandé", "établi"], "faisabilite_execution"),
      createDateElement("date_faisabilite")
    )
  );
  reportContainer.appendChild(
    createReportSentence(
      "relogement_execution",
      "Relogement nécessaire :",
      createSelectElement(["", "oui", "non"], "relogement_execution")
    )
  );

  // Conteneur pour le champ de relogement
  const relogementContainer = document.createElement("div");
  relogementContainer.style.display = "none";
  relogementContainer.classList.add("relogement-container");
  reportContainer.appendChild(relogementContainer);

  relogementContainer.appendChild(
    createReportSentence(
      "courriere_execution",
      "Courrier DDETS :",
      createSelectElement(["", "à faire", "fait"], "courriere_execution"),
      createDateElement("date_courriere")
    )
  );

  // Gérer l'affichage du conteneur de relogement en fonction du choix de l'utilisateur
  const relogementInput = reportContainer.querySelector(
    'select[name="relogement_execution"]'
  );
  relogementInput.addEventListener("change", function () {
    if (relogementInput.value === "oui") {
      relogementContainer.style.display = "block";
    } else {
      relogementContainer.style.display = "none";
    }
  });

  reportContainer.appendChild(
    createReportSentence(
      "ordonnance_execution",
      "Ordonnance d'expulsion :",
      createSelectElement(["", "demandé", "rendue"], "ordonnance_execution"),
      createDateElement("date_ordonnance")
    )
  );
  reportContainer.appendChild(
    createReportSentence(
      "demeure_execution",
      "Mise en demeure :",
      createSelectElement(["", "à faire", "fait"], "demeure_execution"),
      createDateElement("date_demeure")
    )
  );
  reportContainer.appendChild(
    createReportSentence(
      "technique_execution",
      "Suivi technique :",
      createSelectElement(
        ["", "à faire", "en cours", "fait"],
        "technique_execution"
      ),
      createDateElement("date_technique")
    )
  );
  reportContainer.appendChild(
    createReportSentence(
      "recouvrement_execution",
      "Recouvrement post DO :",
      createSelectElement(["", "à faire", "fait"], "recouvrement_execution"),
      createDateElement("date_recouvrement")
    )
  );

  reportContainer.appendChild(
    createReportSentence(
      "demolition_execution",
      "Date de démolition d'office :",
      createDateElement("date_demolition")
    )
  );

  reportContainer.appendChild(
    createReportSentence(
      "communication_execution",
      "Communication sur la DO :",
      createSelectElement(["", "oui", "non"], "communication_execution")
    )
  );

  reportContainer.appendChild(
    createReportSentence(
      "observations_execution",
      "Observations :",
      createTextAreaElement("observations_execution")
    )
  );

  // Ajouter le bouton Soumettre
  const submitButton = document.createElement("button");
  submitButton.type = "button"; // Éviter le comportement par défaut du formulaire
  submitButton.textContent = "Soumettre";
  submitButton.classList.add("btnsoummettre_execution");
  submitButton.addEventListener("click", handleSubmit);
  reportContainer.appendChild(submitButton);

  // Ajouter les informations directement dans la div execution_office
  const executionOfficeDiv = document.getElementById("execution_office");
  executionOfficeDiv.appendChild(reportContainer);
}

function createSelectElement(options, name) {
  const select = document.createElement("select");
  select.name = name;
  options.forEach((optionText) => {
    const option = document.createElement("option");
    option.text = optionText;
    if (optionText === "") {
      option.selected = true; // Sélectionner l'option vide
    }
    select.appendChild(option);
  });
  return select;
}

function createDateElement(name) {
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = name;
  return dateInput;
}

function createTextAreaElement(name) {
  const textArea = document.createElement("textarea");
  textArea.name = name;
  return textArea;
}

function handleSubmit() {
  // Récupérer les données du formulaire ici
  const formData = {
    statut_execution: document.querySelector('select[name="statut_execution"]')
      .value,
    date_statut: document.querySelector('input[name="date_statut"]').value,
    faisabilite_execution: document.querySelector(
      'select[name="faisabilite_execution"]'
    ).value,
    date_faisabilite: document.querySelector('input[name="date_faisabilite"]')
      .value,
    relogement_execution: document.querySelector(
      'select[name="relogement_execution"]'
    ).value,
    courriere_execution: document.querySelector(
      'select[name="courriere_execution"]'
    ).value,
    date_courriere: document.querySelector('input[name="date_courriere"]')
      .value,
    // Ajouter les autres champs ici
    demolition_execution: document.querySelector(
      'input[name="date_demolition"]'
    ).value,
    communication_execution: document.querySelector(
      'select[name="communication_execution"]'
    ).value,
    observations_execution: document.querySelector(
      'textarea[name="observations_execution"]'
    ).value,
  };

  // Exemple : Afficher les données dans la console
  console.log(formData);

  // Ici, vous pouvez envoyer les données à un serveur, les enregistrer localement, etc.
}
