document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.getElementById("submitButton");

  if (submitButton) {
    submitButton.addEventListener("click", function () {
      // Collecter les données du formulaire
      const form = document.querySelector("form");
      const formData = new FormData(form);

      // Envoyer les données au script d'enregistrement
      fetch("../pages/script/script_enregistrement.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Afficher une alerte SweetAlert en cas de succès
            Swal.fire({
              icon: "success",
              title: "Succès",
              text: data.message,
            }).then((result) => {
              // Rediriger vers la page d'accueil après le clic sur "OK"
              if (result.isConfirmed || result.isDismissed) {
                window.location.href = "../index.php";
              }
            });
          } else {
            // Afficher une alerte SweetAlert en cas d'erreur
            Swal.fire({
              icon: "error",
              title: "Erreur",
              text: data.message,
            });
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la requête AJAX : ", error);
        });
    });
  }
});
