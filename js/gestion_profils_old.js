$(document).ready(function () {
  // Assurez-vous que Bootstrap est initialisé
  $('[data-toggle="modal"]').modal();
  // Charger les utilisateurs et leurs rôles lors du chargement de la page
  chargerUtilisateurs();

  var userId; // Déclaration de userId en tant que variable globale

  function chargerUtilisateurs() {
    // Faire une requête Ajax vers script_gestion_profil.php pour récupérer les utilisateurs
    $.ajax({
      url: "../script/script_gestion_profils.php",
      method: "GET",
      dataType: "json",
      success: function (data) {
        console.log(data);
        afficherUtilisateurs(data);

        // Mettre à jour la liste déroulante des rôles
        mettreAJourListeRoles();
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors du chargement des utilisateurs.",
        });
      },
    });
  }

  function mettreAJourListeRoles() {
    // Faire une requête Ajax vers script_roles.php pour récupérer la liste des rôles
    $.ajax({
      url: "../script/script_roles.php",
      method: "GET",
      dataType: "json",
      success: function (data) {
        // Effacer le contenu actuel de la liste déroulante
        $("#nouveauRole").empty();

        // Ajouter les nouvelles options à la liste déroulante
        data.forEach(function (role) {
          $("#nouveauRole").append(
            '<option value="' + role.role + '">' + role.role + "</option>"
          );
        });
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors du chargement des rôles.",
        });
      },
    });
  }

  function afficherUtilisateurs(utilisateurs) {
    // Vérifier si 'utilisateurs' est un tableau
    if (Array.isArray(utilisateurs)) {
      // Effacer le contenu du tableau
      $("#tableUtilisateurs tbody").empty();

      // Parcourir les utilisateurs et les ajouter au tableau
      utilisateurs.forEach(function (utilisateur) {
        var ligne = "<tr>";
        ligne += "<td>" + utilisateur.nom + "</td>";
        ligne += "<td>" + utilisateur.role + "</td>";
        ligne +=
          '<td><button class="btn btn-secondary btn-gestion-role" data-id="' +
          utilisateur.id_user +
          '">Gérer le rôle</button></td>';
        ligne +=
          '<td><button class="btn btn-primary btn-modifier" data-id="' +
          utilisateur.id_user +
          '">Modifier</button></td>';
        ligne +=
          '<td><button class="btn btn-danger btn-supprimer" data-id="' +
          utilisateur.id_user +
          '">Supprimer</button></td>';

        ligne += "</tr>";

        $("#tableUtilisateurs tbody").append(ligne);
      });

      // Ajouter un gestionnaire d'événements pour le bouton "Gérer le rôle"
      $(".btn-gestion-role").click(function () {
        userId = $(this).data("id");
        afficherModalGestionRole(userId);
      });

      // Ajouter un gestionnaire d'événements pour le bouton "Supprimer"
      $(".btn-supprimer").click(function () {
        userId = $(this).data("id");
        demanderConfirmationSuppression(userId);
      });

      $(".btn-modifier").click(function () {
        userId = $(this).data("id");
        afficherModalModification(userId);
        // Afficher la fenêtre popup avec les détails de l'utilisateur
        $("#modalDetailsUtilisateur").modal("show");
      });
    } else {
      console.error("La réponse du serveur n'est pas un tableau.");
    }
  }

  function afficherModalModification(userId) {
    // Faites une requête Ajax pour obtenir les détails de l'utilisateur spécifique
    $.ajax({
      url: "../script/script_gestion_profil.php", // Utilisez le bon nom de script
      method: "GET",
      data: {
        userId: userId,
      },
      dataType: "json",
      success: function (data) {
        // // Afficher les données de l'utilisateur dans la console
        // console.log("Données de l'utilisateur :", data);
        // console.log("Données de l'utilisateur :", data).nomUtilisateur;

        // // Remplissez les champs du formulaire avec les détails de l'utilisateur
        // $("#nomUtilisateur").val(data.nomUtilisateur);
        // $("#prenomUtilisateur").val(data.prenomUtilisateur);
        // $("#mailUtilisateur").val(data.mailUtilisateur);
        chargerListeRoles(data.role); // Appeler la fonction pour charger la liste des rôles
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors du chargement des détails de l'utilisateur.",
        });
      },
    });
  }

  function chargerListeRoles(roleSelectionne) {
    // Faire une requête Ajax vers script_roles.php pour récupérer la liste des rôles
    $.ajax({
      url: "../script/script_roles.php",
      method: "GET",
      dataType: "json",
      success: function (data) {
        // Effacer le contenu actuel de la liste déroulante
        $("#roleUtilisateur").empty();

        // Ajouter les nouvelles options à la liste déroulante
        data.forEach(function (role) {
          var option = $("<option>", {
            value: role.role,
            text: role.role,
          });

          // Sélectionner le rôle correspondant à l'utilisateur
          if (role.role === roleSelectionne) {
            option.attr("selected", true);
          }

          $("#roleUtilisateur").append(option);
        });
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors du chargement des rôles.",
        });
      },
    });
  }

  // function afficherPopupModification(details) {
  //   // Attachez un gestionnaire d'événements au bouton "Sauvegarder"
  //   $("#btnSauvegarderModification").on("click", function () {
  //     // Obtenez les nouvelles données de l'utilisateur depuis le formulaire
  //     var nouveauNom = $("#nomUtilisateur").val();
  //     var nouveauPrenom = $("#prenomUtilisateur").val();
  //     var nouveauRole = $("#roleUtilisateur").val();

  //     // Appelez une fonction pour sauvegarder les modifications
  //     sauvegarderModification(userId, nouveauNom, nouveauPrenom, nouveauRole);
  //   });

  //   // Afficher la modale de modification
  //   $("#modalDetailsUtilisateur").modal("show");
  // }

  function afficherModalGestionRole(userId) {
    // chargerDetailsUtilisateur(userId);

    // Afficher la modale
    $("#modalGestionRole").modal("show");

    // Détacher tous les gestionnaires d'événements "click" du bouton
    $("#btnSauvegarderRole").off("click");

    // Ajouter un nouveau gestionnaire d'événements pour le bouton "Sauvegarder"
    $("#btnSauvegarderRole").on("click", function () {
      var nouveauRole = $("#nouveauRole").val();

      sauvegarderRole(userId, nouveauRole);
    });
  }

  function chargerDetailsUtilisateur(userId) {
    $.ajax({
      url: "../script/script_gestion_profil.php",
      method: "GET",
      data: {
        userId: userId,
      },
      dataType: "json",
      success: function (data) {
        // Affichez la popup de modification avec les données de l'utilisateur
        afficherPopupModification(data);
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors du chargement des détails de l'utilisateurqsdqsqsd.",
        });
      },
    });
  }

  // function chargerDataUser(userId) {
  //   // Faites une requête Ajax pour obtenir les détails de l'utilisateur spécifique
  //   $.ajax({
  //     url: "../script/script_data_user.php",
  //     method: "GET",
  //     data: {
  //       userId: userId,
  //     },
  //     dataType: "json",
  //     success: function (data) {
  //       // Afficher la fenêtre popup avec les détails de l'utilisateur
  //       afficherPopupModification(data);
  //     },
  //     error: function () {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Erreur",
  //         text: "Une erreur s'est produite lors du chargement des détails de l'utilisateur.",
  //       });
  //     },
  //   });
  // }

  function sauvegarderRole(userId, nouveauRole) {
    // Effectuer une requête Ajax pour sauvegarder le nouveau rôle
    $.ajax({
      url: "../script/script_sauvegarder_role.php",
      method: "POST",
      data: {
        userId: userId,
        nouveauRole: nouveauRole,
      },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          // Fermer la modale après la sauvegarde réussie
          $("#modalGestionRole").modal("hide");
          // Recharger la liste des utilisateurs après la modification du rôle
          chargerUtilisateurs();
        } else {
          // Afficher une alerte en cas d'erreur
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text:
              response.message ||
              "Une erreur s'est produite lors de la sauvegarde du rôle.",
          });
        }
      },
      error: function () {
        // Afficher une alerte en cas d'erreur
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la sauvegarde du rôle.",
        });
      },
    });
  }

  // function sauvegarderModification(
  //   userId,
  //   nouveauNom,
  //   nouveauPrenom,
  //   nouveauRole
  // ) {
  //   // Effectuer une requête Ajax pour sauvegarder les nouvelles données
  //   $.ajax({
  //     url: "../script/script_sauvegarder_modification.php",
  //     method: "POST",
  //     data: {
  //       userId: userId,
  //       nouveauNom: nouveauNom,
  //       nouveauPrenom: nouveauPrenom,
  //       nouveauRole: nouveauRole,
  //     },
  //     dataType: "json",
  //     success: function (response) {
  //       if (response.success) {
  //         // Fermer la modale après la sauvegarde réussie
  //         $("#modalDetailsUtilisateur").modal("hide");
  //         // Recharger la liste des utilisateurs après la modification
  //         chargerUtilisateurs();
  //       } else {
  //         // Afficher une alerte en cas d'erreur
  //         Swal.fire({
  //           icon: "error",
  //           title: "Erreur",
  //           text:
  //             response.message ||
  //             "Une erreur s'est produite lors de la sauvegarde des modifications.",
  //         });
  //       }
  //     },
  //     error: function () {
  //       // Afficher une alerte en cas d'erreur
  //       Swal.fire({
  //         icon: "error",
  //         title: "Erreur",
  //         text: "Une erreur s'est produite lors de la sauvegarde des modifications.",
  //       });
  //     },
  //   });
  // }

  ///Suppression d'un USER

  function demanderConfirmationSuppression(userId) {
    // Utilisez SweetAlert2 pour demander la confirmation de la suppression
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        // Si l'utilisateur confirme, appelez la fonction de suppression
        supprimerUtilisateur(userId);
      }
    });
  }

  function supprimerUtilisateur(userId) {
    // Faites une requête Ajax pour supprimer l'utilisateur
    $.ajax({
      url: "../script/script_supprimer_utilisateur.php",
      method: "POST",
      data: {
        userId: userId,
      },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          location.reload();
        } else {
          // Affichez une alerte en cas d'erreur
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text:
              response.message ||
              "Une erreur s'est produite lors de la suppression de l'utilisateur.",
          });
        }
      },
      error: function () {
        // Affichez une alerte en cas d'erreur
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Une erreur s'est produite lors de la suppression de l'utilisateur.",
        });
      },
    });
  }
});
