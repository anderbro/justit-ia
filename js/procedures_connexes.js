document.addEventListener("DOMContentLoaded", function () {
  function afficherProcedures(procedures) {
    var tbody = document.querySelector("#table-procedures tbody");
    tbody.innerHTML = ""; // Efface le contenu existant du tableau
    procedures.forEach(function (procedure) {
      var tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${procedure.conn_date}</td>
                <td>${procedure.conn_ref}</td>
                <td>${procedure.conn_auteur_1}</td>
                <td>${procedure.conn_type}</td>
                <td>${procedure.conn_auteur_2}</td>
                <td>${procedure.conn_obs}</td>
                <td>
                    <button class="btn-modifier-procedure" data-id="${procedure.id_conn}"><img src="../img/edit.svg"></button>
                    <button class="btn-supprimer-procedure" data-id="${procedure.id_conn}"><img src="../img/delete.svg"></button>
                </td>
            `;
      tbody.appendChild(tr);
    });

    // Ajouter des écouteurs d'événements aux boutons de suppression et de modification
    var btnsSupprimer = document.querySelectorAll(".btn-supprimer-procedure");
    var btnsModifier = document.querySelectorAll(".btn-modifier-procedure");
    btnsSupprimer.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idProcedure = btn.getAttribute("data-id");
        // Appeler la fonction de suppression avec l'ID de la procédure
        supprimerProcedureConnexe(idProcedure);
      });
    });
    btnsModifier.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idProcedure = btn.getAttribute("data-id");
        // Ajouter ici la logique pour la modification de la procédure
        modifierProcedureConnexe(idProcedure);
      });
    });
  }

  var btnNouvelleProcedure = document.getElementById("btnNouvelleProcedure");
  btnNouvelleProcedure.addEventListener("click", function () {
    // Ouvrir la modale d'ajout
    var modalAjout = document.getElementById("myModal");
    modalAjout.style.display = "block";
  });

  // Fonction pour supprimer une procédure connexe
  function supprimerProcedureConnexe(idProcedure) {
    // Afficher une fenêtre de confirmation avec SweetAlert
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Cette action est irréversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (this.readyState === 4) {
            if (this.status === 200) {
              var response = JSON.parse(this.responseText);
              if (response.success) {
                // Afficher un message de succès avec SweetAlert
                Swal.fire(
                  "Supprimé!",
                  "La procédure connexe a été supprimée avec succès.",
                  "success"
                ).then(() => {
                  // Recharger la page après la suppression réussie
                  window.location.reload();
                });
              } else {
                // Afficher un message d'erreur en cas d'échec de la suppression avec SweetAlert
                Swal.fire(
                  "Erreur!",
                  "Erreur lors de la suppression de la procédure connexe : " +
                    response.message,
                  "error"
                );
              }
            } else {
              // Afficher un message d'erreur en cas d'erreur de requête AJAX avec SweetAlert
              Swal.fire(
                "Erreur!",
                "Erreur lors de la requête AJAX : " + this.status,
                "error"
              );
            }
          }
        };
        xhr.open(
          "POST",
          "script/proc_con/script_supprimer_proc_connexe.php",
          true
        );
        xhr.setRequestHeader(
          "Content-Type",
          "application/x-www-form-urlencoded"
        );
        xhr.send("id=" + encodeURIComponent(idProcedure));
      }
    });
  }

  // Fonction pour récupérer les paramètres de l'URL
  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  // Récupérer l'ID de dossier depuis l'URL
  var idDossier = getParameterByName("id");

  // Vérifier si l'ID de dossier est présent dans l'URL
  if (idDossier !== null) {
    // Effectuer une requête AJAX pour récupérer les procédures connexes du dossier
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          var procedures = JSON.parse(this.responseText);
          // Filtrer les procédures connexes en fonction de l'ID de dossier
          var filteredProcedures = procedures.filter(function (procedure) {
            return procedure.id_dossier == idDossier;
          });
          // Afficher les procédures filtrées dans le tableau HTML
          afficherProcedures(filteredProcedures);
        } else {
          // Afficher un message d'erreur en cas d'erreur de requête AJAX
          alert("Erreur lors de la requête AJAX : " + this.status);
        }
      }
    };
    xhr.open(
      "GET",
      "../pages/script/proc_con/script_procedures_connexes.php",
      true
    );
    xhr.send();
  } else {
    // Afficher un message d'erreur si l'ID de dossier est manquant dans l'URL
    alert("ID de dossier manquant dans l'URL");
  }

  var modal = document.getElementById("myModal");
  var btnNouvelleProcedure = document.getElementById("btnNouvelleProcedure");
  var spanClose = document.getElementsByClassName("close")[0];

  btnNouvelleProcedure.onclick = function () {
    modal.style.display = "block";
  };

  spanClose.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Ajoutez le code pour afficher SweetAlert après avoir ajouté une nouvelle procédure connexe
  var formProcedure = document.getElementById("formProcedure");
  formProcedure.addEventListener("submit", function (event) {
    event.preventDefault();
    var formData = new FormData(formProcedure);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          var response = JSON.parse(this.responseText);
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Succès",
              text: response.message,
              confirmButtonColor: "#3085d6",
              confirmButtonText: "OK",
            }).then((result) => {
              if (result.isConfirmed) {
                setTimeout(function () {
                  location.reload();
                }, 1000);
              }
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Erreur",
              text: response.message,
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
          }
        } else {
          console.log("Erreur lors de la requête AJAX :", this.status);
        }
      }
    };
    xhr.open("POST", "script/proc_con/script_add_proc_connexe.php", true);
    xhr.send(formData);
  });

  // Vérifier si l'ID de dossier est présent dans l'URL
  if (idDossier !== null) {
    // Récupérer le champ ID dossier dans le formulaire
    var idDossierInput = document.getElementById("id_dossier");
    // Remplir automatiquement le champ ID dossier avec la valeur récupérée depuis l'URL
    idDossierInput.value = idDossier;
  } else {
    // Afficher un message d'erreur si l'ID de dossier est manquant dans l'URL
    alert("ID de dossier manquant dans l'URL");
  }

  // Fonction pour récupérer les détails d'une procédure connexe à partir de son ID
  function recupererProcedure(idProcedure) {
    var procedure = null; // Initialiser la variable de procédure à null

    // Effectuer une requête AJAX pour récupérer les détails de la procédure connexe
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          procedure = JSON.parse(this.responseText); // Mettre à jour la variable de procédure avec les données reçues
        } else {
          // Afficher un message d'erreur en cas d'échec de la requête AJAX
          alert(
            "Erreur lors de la récupération des détails de la procédure connexe : " +
              this.status
          );
        }
      }
    };
    xhr.open(
      "GET",
      "../pages/script/proc_con/script_recuperer_proc_connexe.php?id=" +
        encodeURIComponent(idProcedure),
      false
    ); // Utiliser une requête synchrone pour attendre la réponse
    xhr.send();

    return procedure; // Retourner les détails de la procédure connexe
  }

  // Fonction pour récupérer les détails de la procédure connexe à partir de son ID
  function recupererEtRemplirProcedure(idProcedure) {
    fetch(
      "../pages/script/proc_con/script_recuperer_proc_connexe.php?id=" +
        encodeURIComponent(idProcedure)
    )
      .then((response) => response.json())
      .then((data) => {
        // Remplir les champs du formulaire avec les données récupérées
        document.getElementById("inputDate").value = data.conn_date;
        document.getElementById("inputRef").value = data.conn_ref;
        document.getElementById("inputAuteur1").value = data.conn_auteur_1;
        document.getElementById("inputType").value = data.conn_type;
        document.getElementById("inputAuteur2").value = data.conn_auteur_2;
        document.getElementById("inputObs").value = data.conn_obs;

        // Ouvrir la modale de modification
        var modalModifier = document.getElementById("modalModifier");
        modalModifier.style.display = "block";
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération des détails de la procédure connexe:",
          error
        );
        // Afficher un message d'erreur en cas d'échec de la récupération des données
        alert(
          "Erreur lors de la récupération des détails de la procédure connexe"
        );
      });
  }

  // Ajouter un écouteur d'événement pour les boutons "Modifier"
  var btnsModifier = document.querySelectorAll(".btn-modifier-procedure");
  btnsModifier.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idProcedure = btn.getAttribute("data-id");
      // Appeler la fonction pour récupérer et remplir les détails de la procédure connexe
      recupererEtRemplirProcedure(idProcedure);
    });
  });

  // Fonction pour ouvrir la modale de modification avec les données de la procédure connexe sélectionnée
  function modifierProcedureConnexe(idProcedure) {
    // Récupérer la procédure connexe à partir de son ID et pré-remplir le formulaire
    var procedure = recupererProcedure(idProcedure); // Fonction à implémenter pour récupérer les données de la procédure connexe

    // Remplir le formulaire avec les données de la procédure
    document.getElementById("inputId").value = procedure.id_conn;
    document.getElementById("inputDate").value = procedure.conn_date || ""; // Remplir la date, ou laisser vide si non disponible
    document.getElementById("inputRef").value = procedure.conn_ref || ""; // Remplir la référence, ou laisser vide si non disponible
    document.getElementById("inputAuteur1").value =
      procedure.conn_auteur_1 || ""; // Remplir l'auteur 1, ou laisser vide si non disponible
    document.getElementById("inputType").value = procedure.conn_type || ""; // Remplir le type, ou laisser vide si non disponible
    document.getElementById("inputAuteur2").value =
      procedure.conn_auteur_2 || ""; // Remplir l'auteur 2, ou laisser vide si non disponible
    document.getElementById("inputObs").value = procedure.conn_obs || ""; // Remplir les observations, ou laisser vide si non disponibles

    // Ouvrir la modale de modification
    var modalModifier = document.getElementById("modalModifier");
    modalModifier.style.display = "block";
  }

  // Ajouter un écouteur d'événements pour le formulaire de modification
  var formModifierProcedure = document.getElementById("formModifierProcedure");
  formModifierProcedure.addEventListener("submit", function (event) {
    event.preventDefault();
    var formData = new FormData(formModifierProcedure);
    var idProcedure = document.getElementById("inputId").value;
    mettreAJourProcedureConnexe(idProcedure, formData);
  });

  document.querySelectorAll("#myModal .close").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.getElementById("myModal").style.display = "none";
    });
  });

  document.querySelectorAll("#modalModifier .closemodif").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.getElementById("modalModifier").style.display = "none";
    });
  });

  // Récupérer la modale et le bouton de fermeture
  var modalmodif = document.getElementById("modalModifier");
  var closeBtn = document.getElementById("closebtn");

  // Fermer la modale lorsque l'utilisateur clique sur la croix
  closeBtn.addEventListener("click", function () {
    modalmodif.style.display = "none";
  });

  // Fermer la modale lorsque l'utilisateur clique en dehors de la fenêtre modale
  window.addEventListener("click", function (event) {
    if (event.target == modalmodif) {
      modalmodif.style.display = "none";
    }
  });

  // Fonction pour mettre à jour une procédure connexe
  function mettreAJourProcedureConnexe(idProcedure, formData) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          var response = JSON.parse(this.responseText);
          if (response.success) {
            // Fermer la modale de modification après la mise à jour réussie
            var modalModifier = document.getElementById("modalModifier");
            modalModifier.style.display = "none";
            // Afficher un message de succès avec SweetAlert
            Swal.fire({
              icon: "success",
              title: "Succès",
              text: "La procédure connexe a été mise à jour avec succès.",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "OK",
            }).then((result) => {
              if (result.isConfirmed) {
                // Recharger la page ou mettre à jour les données si nécessaire
                window.location.reload();
              }
            });
          } else {
            // Afficher un message d'erreur en cas d'échec de la mise à jour avec SweetAlert
            Swal.fire({
              icon: "error",
              title: "Erreur",
              text:
                "Erreur lors de la mise à jour de la procédure connexe : " +
                response.message,
              confirmButtonColor: "#d33",
              confirmButtonText: "OK",
            });
          }
        } else {
          // Afficher un message d'erreur en cas d'erreur de requête AJAX avec SweetAlert
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Erreur lors de la requête AJAX : " + this.status,
            confirmButtonColor: "#d33",
            confirmButtonText: "OK",
          });
        }
      }
    };
    xhr.open(
      "POST",
      "../pages/script/proc_con/script_modifier_proc_connexe.php",
      true
    );
    xhr.send(formData);
  }
});
