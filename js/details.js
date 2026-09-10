document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const dossierId = urlParams.get("id");
  const type = urlParams.get("type");

  fetch("script/script_details.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "id=" + dossierId + "&type=" + type,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const numDossierHeader = document.getElementById("numDossierHeader");
      const dossier = data.details && data.details[0];

      if (numDossierHeader && dossier) {
        numDossierHeader.value = dossier.num_dossier || "";
      }

      const resumeCont = document.getElementById("resumecont");
      if (!resumeCont || !dossier) {
        return;
      }

      function createField(className, labelText, control) {
        const field = document.createElement("div");
        field.className = "resume-field " + className;
        const label = document.createElement("label");
        label.textContent = labelText;
        field.appendChild(label);
        field.appendChild(control);
        return field;
      }

      function createCheckbox(name, checked) {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = name;
        input.checked = Boolean(checked) && checked !== "0" && checked !== "non";
        return input;
      }

      const parcelleInput = document.createElement("input");
      parcelleInput.type = "text";
      parcelleInput.name = "parcelle_princ";
      parcelleInput.value = dossier.parcelle_princ || "";

      const cabanisationInput = createCheckbox("cabanisation", dossier.cabanisation);
      const sensibleInput = createCheckbox("dossier_sensible", dossier.dossier_sensible);

      const prescriptionInput = createCheckbox("prescription", dossier.prescription);
      const prescriptionDate = document.createElement("input");
      prescriptionDate.type = "date";
      prescriptionDate.name = "date_prescription";
      prescriptionDate.value = dossier.date_prescription || "";
      const prescriptionField = document.createElement("div");
      prescriptionField.className = "resume-field resume-field--check-date";
      const prescriptionLabel = document.createElement("label");
      prescriptionLabel.textContent = "Prescription";
      const prescriptionLe = document.createElement("span");
      prescriptionLe.className = "label-date";
      prescriptionLe.textContent = "Le";
      prescriptionField.append(prescriptionLabel, prescriptionInput, prescriptionLe, prescriptionDate);

      const archivageInput = createCheckbox("archivage", dossier.archivage);
      const archivageDate = document.createElement("input");
      archivageDate.type = "date";
      archivageDate.name = "date_archivage";
      archivageDate.value = dossier.date_archivage || "";
      const archivageField = document.createElement("div");
      archivageField.className = "resume-field resume-field--check-date";
      const archivageLabel = document.createElement("label");
      archivageLabel.textContent = "Archivage";
      const archivageLe = document.createElement("span");
      archivageLe.className = "label-date";
      archivageLe.textContent = "Le";
      archivageField.append(archivageLabel, archivageInput, archivageLe, archivageDate);

      const communeInput = document.createElement("input");
      communeInput.type = "text";
      communeInput.name = "commune";
      communeInput.value = dossier.commune || "";

      const observationInput = document.createElement("textarea");
      observationInput.name = "obs_dossier";
      observationInput.className = "observation-input";
      observationInput.value = dossier.obs_dossier || "";
      observationInput.rows = 5;

      const validerButton = document.createElement("button");
      validerButton.type = "button";
      validerButton.textContent = "Valider";
      validerButton.className = "valider-button";
      validerButton.addEventListener("click", function () {
        saveResumeChanges(dossierId, {
          parcelle_princ: parcelleInput.value,
          cabanisation: cabanisationInput.checked ? "oui" : "",
          dossier_sensible: sensibleInput.checked ? 1 : 0,
          prescription: prescriptionInput.checked ? 1 : 0,
          date_prescription: prescriptionDate.value,
          archivage: archivageInput.checked ? 1 : 0,
          date_archivage: archivageDate.value,
          commune: communeInput.value,
          obs_dossier: observationInput.value,
        });
      });

      function applyDocumentFields(fields) {
        if (fields.parcelle_principale) {
          parcelleInput.value = fields.parcelle_principale;
        }
        if (fields.parcelles_secondaires && !parcelleInput.value) {
          parcelleInput.value = fields.parcelles_secondaires;
        }
        if (fields.cabanisation) {
          cabanisationInput.checked = fields.cabanisation === "Oui";
        }
        if (fields.dossier_sensible) {
          sensibleInput.checked = fields.dossier_sensible === "Oui";
        }
        if (fields.commune) {
          communeInput.value = fields.commune;
        }
        const extras = [];
        const identity = [fields.contrevenant_prenom, fields.contrevenant_nom, fields.contrevenant_adresse]
          .filter(Boolean)
          .join(" ");
        if (identity) {
          extras.push("Contrevenant : " + identity);
        }
        if (fields.observations) {
          extras.push(fields.observations);
        }
        if (extras.length) {
          const current = observationInput.value.trim();
          const addition = extras.join("\n");
          observationInput.value = current && current.indexOf(addition) === -1
            ? current + "\n" + addition
            : addition;
        }
      }

      resumeCont.appendChild(createField("", "Parcelle principale", parcelleInput));
      resumeCont.appendChild(createField("resume-field--check", "Cabanisation", cabanisationInput));
      resumeCont.appendChild(createField("resume-field--check", "Dossier sensible", sensibleInput));
      resumeCont.appendChild(prescriptionField);
      resumeCont.appendChild(archivageField);
      resumeCont.appendChild(createField("", "Commune", communeInput));
      resumeCont.appendChild(createField("resume-field--textarea", "Observations", observationInput));

      const actions = document.createElement("div");
      actions.className = "resume-actions";
      actions.appendChild(validerButton);
      resumeCont.appendChild(actions);

      const documentButton = document.getElementById("btnAjouterDocument");
      const fileInput = document.getElementById("resumeDocument");
      const statusEl = document.getElementById("resumeDocStatus");
      const communesNode = document.getElementById("communesJson");
      if (documentButton) {
        documentButton.addEventListener("click", function () {
          if (fileInput) {
            fileInput.click();
          }
        });
      }
      if (fileInput) {
        fileInput.addEventListener("change", function () {
          const file = fileInput.files && fileInput.files[0];
          if (!file) {
            return;
          }
          const formData = new FormData();
          formData.append("document", file);
          formData.append("communes", communesNode ? communesNode.textContent : "[]");
          formData.append("id_dossier", dossierId);
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent = "Lecture du document et création des éléments…";
            statusEl.className = "ai-status ai-status--pending";
          }
          if (documentButton) {
            documentButton.disabled = true;
          }
          fetch("script/script_importer_document.php", {
            method: "POST",
            body: formData,
          })
            .then(function (response) {
              return response.json().then(function (data) {
                if (!response.ok || !data.success) {
                  throw new Error(data.error || data.detail || "Import impossible.");
                }
                return data;
              });
            })
            .then(function (data) {
              applyDocumentFields(data.fields || {});
              const created = data.created || {};
              const labels = {
                contrevenants: "contrevenant(s)",
                infractions: "infraction(s)",
                parquets: "entrée(s) parquet",
                avis: "avis",
                audiences: "audience(s)",
                decisions: "décision(s)",
                recours: "recours",
                courriers: "courrier(s)",
                rapports: "rapport(s)",
                requetes: "requête(s)",
                recouvrements: "recouvrement(s)",
                procedures_liees: "procédure(s) liée(s)",
              };
              const lines = [];
              Object.keys(labels).forEach(function (key) {
                const count = parseInt(created[key], 10) || 0;
                if (count > 0) {
                  lines.push(count + " " + labels[key]);
                }
              });
              if (data.skipped && data.skipped.length) {
                lines.push(data.skipped.join(" ; "));
              }
              if (statusEl) {
                statusEl.textContent = lines.length
                  ? "Dossier mis à jour : " + lines.join(", ") + "."
                  : "Document lu. Le résumé a été enregistré.";
                statusEl.className = "ai-status ai-status--ok";
              }
              Swal.fire({
                icon: "success",
                title: "Document importé",
                html: (lines.length ? lines.join("<br>") : "Résumé enregistré.") +
                  "<br><br>La page va se recharger pour afficher tous les onglets.",
                confirmButtonText: "OK",
              }).then(function () {
                window.location.reload();
              });
            })
            .catch(function (error) {
              if (statusEl) {
                statusEl.textContent = error.message;
                statusEl.className = "ai-status ai-status--error";
              }
              Swal.fire({
                icon: "error",
                title: "Analyse impossible",
                text: error.message,
              });
            })
            .finally(function () {
              if (documentButton) {
                documentButton.disabled = false;
              }
              fileInput.value = "";
            });
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

function saveResumeChanges(dossierId, payload) {
  fetch("script/script_modification_dossier.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "id=" + encodeURIComponent(dossierId) + "&type=dossier&data=" + encodeURIComponent(JSON.stringify(payload)),
  })
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
          title: "Enregistré",
          text: "Les modifications du dossier ont été enregistrées.",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: data.error || "Impossible d'enregistrer les modifications.",
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête AJAX : ", error);
      Swal.fire({
        icon: "error",
        title: "Erreur AJAX",
        text: "Une erreur s'est produite lors de l'enregistrement des modifications.",
      });
    });
}
