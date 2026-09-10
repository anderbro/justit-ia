var modal;

document.addEventListener("DOMContentLoaded", function () {
  modal = document.getElementById("modalFormAgent");
  const url = "../pages/script/agent/script_agents.php";

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur réseau");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data); // Afficher les données dans la console
      const agents = data.agents; // Assurez-vous que cela correspond au format de votre JSON
      const container = document.getElementById("tableContainer");

      // Création du tableau
      const table = document.createElement("table");
      table.setAttribute("class", "table");

      // Ajout de l'en-tête du tableau
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      ["Nom", "Prénom", "Rôle", "Service", "Actions"].forEach((text) => {
        const headerCell = document.createElement("th");
        headerCell.textContent = text;
        headerRow.appendChild(headerCell);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Ajout des lignes du tableau
      const tbody = document.createElement("tbody");
      agents.forEach((agent) => {
        const row = document.createElement("tr");
        ["agent_nom", "agent_prenom", "agent_role", "agent_service"].forEach(
          (property) => {
            const cell = document.createElement("td");
            cell.textContent = agent[property];
            row.appendChild(cell);
          }
        );

        // Ajout de la colonne pour les boutons
        const actionCell = document.createElement("td");

        // Création du bouton Modifier
        const modifyButton = document.createElement("button");
        modifyButton.textContent = "Modifier";
        modifyButton.innerHTML = '<img src="../img/edit.svg" alt="">';
        modifyButton.classList.add("btn", "btn-modifier");
        modifyButton.setAttribute("data-id", agent.id); // Ajout de l'ID de l'agent comme attribut data-id
        actionCell.appendChild(modifyButton);

        // Création du bouton Supprimer
        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<img src="../img/delete.svg" alt="">';
        deleteButton.classList.add("btn", "btn-supprimer"); // Ajoutez des classes pour le style si nécessaire
        deleteButton.setAttribute("data-id", agent.id); // Ajout de l'ID de l'agent comme attribut data-id
        actionCell.appendChild(deleteButton);

        // Ajout de la cellule d'action à la ligne
        row.appendChild(actionCell);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);

      // Ajout du tableau au conteneur
      while (container.firstChild) {
        container.removeChild(container.firstChild); // Efface le contenu précédent
      }
      container.appendChild(table);

      // Ajout de l'écouteur d'événement pour le clic sur le bouton Modifier
      document.querySelectorAll(".btn-modifier").forEach((button) => {
        button.addEventListener("click", function () {
          const agentId = this.getAttribute("data-id");
          modifyAgent(agentId, agents); // Appel de la fonction de modification d'agent avec les données des agents
        });
      });

      // Ajout de l'écouteur d'événement pour le clic sur le bouton archiver
      document.querySelectorAll(".btn-supprimer").forEach((button) => {
        button.addEventListener("click", function () {
          const agentId = this.getAttribute("data-id");
          Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Vous ne pourrez pas revenir en arrière!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, archiver!",
          }).then((result) => {
            if (result.isConfirmed) {
              archiverAgent(agentId);
            }
          });
        });
      });
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des données:", error);
      const container = document.getElementById("tableContainer");
      while (container.firstChild) {
        container.removeChild(container.firstChild); // Efface le contenu précédent
      }
      container.textContent = "Erreur lors du chargement des données.";
    });

  // Obtenir le modal
  var modal = document.getElementById("modalFormAgent");

  // Obtenir le bouton qui ouvre le modal
  var btn = document.getElementById("btnNouvelAgent");

  // Obtenir l'élément <span> qui ferme le modal
  var span = document.getElementsByClassName("close")[0];

  // Quand l'utilisateur clique sur le bouton, ouvrir le modal
  btn.onclick = function () {
    modal.style.display = "block";
  };

  // Quand l'utilisateur clique sur <span> (x), fermer le modal
  span.onclick = function () {
    modal.style.display = "none";
  };

  // Quand l'utilisateur clique n'importe où en dehors du modal, le fermer
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  document
    .getElementById("btnAjouterAgent")
    .addEventListener("click", function () {
      var formData = new FormData(document.getElementById("formAjoutAgent"));

      fetch("../pages/script/agent/script_ajouter_agent.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          // Utilisation de SweetAlert2 pour afficher le résultat
          Swal.fire({
            title: "Ajout d'un agent",
            text: data.message,
            icon: "success",
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload(); // Recharge la page
            }
          });
        })
        .catch((error) => {
          console.error("Erreur:", error);
          // Utilisation de SweetAlert2 pour afficher l'erreur
          Swal.fire({
            title: "Erreur",
            text: "Erreur lors de l'ajout de l'agent.",
            icon: "error",
            confirmButtonText: "OK",
          });
        });
    });
});

// Fonction de suppression d'agent
function archiverAgent(agentId) {
  fetch("../pages/script/agent/script_archiver_agent.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "id=" + encodeURIComponent(agentId),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire("archivé!", data.message, "success").then(() =>
          window.location.reload()
        );
      } else {
        Swal.fire("Erreur!", data.message, "error");
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
      Swal.fire("Erreur!", "La requête a échoué.", "error");
    });
}

function modifyAgent(agentId, agents) {
  // Récupérer les données de l'agent
  const agentData = agents.find((agent) => agent.id === agentId);

  console.log(agentData, agentId, agents);

  // Conteneur de modification
  const modifyContainer = document.createElement("div");
  const formData = new FormData();
  // Création du formulaire
  const form = document.createElement("modalFormAgentModif");
  form.id = "formModifierAgent";
  console.log("form c'est quoi : ",form);

  // Ajout de l'ID de l'agent (caché)
  const agentIdInput = document.createElement("input");
  
  agentIdInput.type = "hidden";
  agentIdInput.name = "id";
  agentIdInput.value = agentData.id;
  form.appendChild(agentIdInput);
  
  // Ajout des champs du formulaire avec les données de l'agent

  // Le nom
  const nomInput = document.createElement("input");
  const labelNom = document.createElement("label");
  labelNom.innerHTML = "Nom :";
  nomInput.type = "text";
  nomInput.name = "nouveau_nom";
  nomInput.value = agentData.agent_nom;
  form.appendChild(labelNom);
  form.appendChild(nomInput);

  // Le prenom
  const prenomInput = document.createElement("input");
  const labelPrenom = document.createElement("label");
  labelPrenom.innerHTML = "Prenom :";
  prenomInput.type = "text";
  prenomInput.name = "nouveau_prenom";
  prenomInput.value = agentData.agent_prenom;
  form.appendChild(labelPrenom);
  form.appendChild(prenomInput);

  // Le role
  const selectRole = document.createElement("select");
  const labelRole = document.createElement("label");
  labelRole.htmlFor = "role";
  labelRole.innerHTML = "Rôle :"
  selectRole.id = "role";
  selectRole.name = "nouveau_role";
  selectRole.required = true;
  // Créer et ajouter les options au select
  const optionJuriste = document.createElement("option");
  optionJuriste.value = "juriste";
  optionJuriste.text = "juriste";
  const optionControleur = document.createElement("option");
  optionControleur.value = "contrôleur";
  optionControleur.text = "contrôleur";
  // Ajouter les options au select
  selectRole.appendChild(optionJuriste);
  selectRole.appendChild(optionControleur);
  // Sélectionner la valeur actuelle de l'agent, si elle existe
  if (agentData.agent_role) {
    selectRole.value = agentData.agent_role;
  }
   // Ajouter le label et le select au formulaire
  form.appendChild(labelRole);
  form.appendChild(selectRole);
  
  // Le service
const selectService = document.createElement("select");
const labelService = document.createElement("label");
labelService.htmlFor = "service";
labelService.innerHTML = "Service :";
selectService.id = "service";
selectService.name = "nouveau_service";
selectService.required = true;
// Créer et ajouter les options au select pour le service
const optionSATO = document.createElement("option");
optionSATO.value = "SATO";
optionSATO.text = "SATO";
const optionSTU = document.createElement("option");
optionSTU.value = "STU";
optionSTU.text = "STU";
const optionSAJ = document.createElement("option");
optionSAJ.value = "SAJ";
optionSAJ.text = "SAJ";

// Ajouter les options au select pour le service
selectService.appendChild(optionSATO);
selectService.appendChild(optionSTU);
selectService.appendChild(optionSAJ);

// Sélectionner la valeur actuelle de l'agent pour le service, si elle existe
if (agentData.agent_service) {
  selectService.value = agentData.agent_service;
}

// Ajouter le label et le select pour le service au formulaire
form.appendChild(labelService);
form.appendChild(selectService);
  

  for (const pair of formData.entries()) {
    console.log(" formData : ",pair[0] + ': ' + pair[1]);
  }  

  // Ajout du formulaire au conteneur de modification
  modifyContainer.appendChild(form);
  // Ajout du bouton de soumission
  const submitButton = document.createElement("button");
  submitButton.innerText = "Enregistrer";
  submitButton.classList.add("btn-enregistrer"); 
  submitButton.id = "btnModifierAgent"; // Ajoutez l'ID pour les styles de survol spécifiques// Ajoutez des classes pour le style si nécessaire
  submitButton.addEventListener("click", function () {
    formData.append(agentIdInput.name,agentIdInput.value);
    formData.append(serviceInput.name,serviceInput.value);
    formData.append(selectRole.name,selectRole.value);
    formData.append(prenomInput.name,prenomInput.value);
    formData.append(nomInput.name,nomInput.value);




    // Soumettre le formulaire
    
    

    fetch("../pages/script/agent/script_modifier_agent.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        // Vérifiez la réponse et affichez un message approprié
        console.log(data);
        if (data.success) {
          Swal.fire({
            title: "Agent modifié!",
            text: data.message,
            icon: "success",
          }).then(() => {
            window.location.reload(); // Recharge la page après la modification
          });
        } else {
          Swal.fire({
            title: "Erreur!",
            text: data.message,
            icon: "error",
          });
        }
      })
      .catch((error) => {
        console.error("Erreur:", error);
        Swal.fire({
          title: "Erreur!",
          text: "Une erreur s'est produite lors de la modification de l'agent.",
          icon: "error",
        });
      });
  });
  modifyContainer.appendChild(submitButton);

  // Ajout du bouton de fermeture
  const closeButton = document.createElement("button");
  closeButton.innerText = "Fermer";
  closeButton.classList.add("btn-enregistrer"); 
  closeButton.id = "btnModifierAgent"; // Ajoutez l'ID pour les styles de survol spécifiques// Ajoutez des classes pour le style si nécessaire
  closeButton.addEventListener("click", function () {
    // Fermer la fenêtre modale
    Swal.close();
  });
  modifyContainer.appendChild(closeButton);

  // Afficher la fenêtre modale avec le formulaire de modification
  Swal.fire({
    title: "Modifier l'agent",
    html: modifyContainer,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
  });
}
