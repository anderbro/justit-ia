// Ajoutez ce script à votre fichier JavaScript
document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      // Effectuez une requête Ajax vers le script de déconnexion
      fetch("./script/script_deconnexion.php", {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Redirigez ou effectuez d'autres actions après la déconnexion
            window.location.href = "./connexion/connexion.php";
          } else {
            // Affichez une alerte en cas d'échec de la déconnexion
            Swal.fire({
              icon: "error",
              title: "Erreur de déconnexion",
              text:
                data.message ||
                "Une erreur s'est produite lors de la déconnexion_2.",
            });
          }
        })
        .catch((error) => {
          // Affichez une alerte en cas d'erreur
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Une erreur s'est produite lors de la déconnexion_1.",
          });
        });
    });
  }
});
