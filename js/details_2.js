document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");

  fetch("script/script_details.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "id=" + dossierId,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const mainDetailsForm = document.getElementById("mainDetailsForm");

      if (data.details.length > 0) {
        mainDetailsForm.querySelector("#numDossier").value =
          data.details[0].num_dossier;
        mainDetailsForm.querySelector("#nSoitTransmis").value =
          data.details[0].n_soit_transmis;
        mainDetailsForm.querySelector("#parcellePrinc").value =
          data.details[0].parcelle_princ;

        const cassationDetailsForm =
          document.getElementById("cassationDetails");
        const appelDetailsForm = document.getElementById("appelDetailsForm");
        const tribunalDetailsForm = document.getElementById(
          "tribunalDetailsForm"
        );

        if (cassationDetailsForm && appelDetailsForm && tribunalDetailsForm) {
          const details = data.details[0];

          // Parcours des propriétés de l'objet details
          for (const key in details) {
            if (details.hasOwnProperty(key)) {
              const formGroup = document.createElement("div");
              formGroup.classList.add("form-group");

              const input = document.createElement("input");
              input.type = "text";
              input.id = key;
              input.name = key;
              input.value = details[key];
              input.disabled = true;

              const label = document.createElement("label");
              label.htmlFor = key;
              label.innerText = key;

              formGroup.appendChild(label);
              formGroup.appendChild(input);

              if (key.startsWith("cass_")) {
                cassationDetailsForm.appendChild(formGroup);
              } else if (key.startsWith("ca_")) {
                appelDetailsForm.appendChild(formGroup);
              } else if (key.startsWith("tc_")) {
                tribunalDetailsForm.appendChild(formGroup);
              }
            }
          }
        } else {
          Swal.fire({
            icon: "info",
            title: "Formulaire introuvable",
            text: "Le formulaire cassationDetailsForm, appelDetailsForm, ou tribunalDetailsForm n'a pas été trouvé dans le document.",
          });
        }
      } else {
        Swal.fire({
          icon: "info",
          title: "Aucun détail trouvé",
          text: "Aucun détail correspondant à l'identifiant fourni.",
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de la récupération des détails.",
      });
    });
});
