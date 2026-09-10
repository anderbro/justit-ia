document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("creationForm");
  if (!form) {
    return;
  }

  const submitButton = document.getElementById("submitButton");
  const dropzone = document.getElementById("aiDropzone");
  const fileInput = document.getElementById("aiDocument");
  const pickButton = document.getElementById("aiPickButton");
  const statusEl = document.getElementById("aiStatus");

  function setStatus(message, kind) {
    if (!statusEl) {
      return;
    }
    statusEl.hidden = !message;
    statusEl.textContent = message || "";
    statusEl.className = "ai-status" + (kind ? " ai-status--" + kind : "");
  }

  function fillField(name, value) {
    if (value === undefined || value === null || String(value).trim() === "") {
      return false;
    }
    const field = form.elements[name];
    if (!field) {
      return false;
    }
    if (field.type === "radio") {
      const radios = form.querySelectorAll('input[name="' + name + '"]');
      radios.forEach(function (radio) {
        radio.checked = radio.value === value;
      });
    } else {
      field.value = value;
    }
    const group = field.closest ? field.closest(".form-group, .radio-group") : null;
    if (group) {
      group.classList.add("is-ai-filled");
    }
    return true;
  }

  function applyExtractedFields(payload) {
    const fields = payload.fields || {};
    form.querySelectorAll(".is-ai-filled").forEach(function (el) {
      el.classList.remove("is-ai-filled");
    });

    fillField("numero_dossier", fields.numero_dossier);
    fillField("commune", fields.commune);
    fillField("priorite", fields.priorite);
    fillField("date_du_soit_transmis", fields.date_du_soit_transmis);
    fillField("parcelle_principale", fields.parcelle_principale);
    fillField("parcelles_secondaires", fields.parcelles_secondaires);
    fillField("date_courrier", fields.date_courrier);
    fillField("cabanisation", fields.cabanisation || "Non");
    fillField("dossier_sensible", fields.dossier_sensible || "Non");
    fillField("detruit", fields.detruit || "Non");

    const identity = [fields.contrevenant_prenom, fields.contrevenant_nom, fields.contrevenant_adresse]
      .filter(Boolean)
      .join(" ");
    let observations = fields.observations || "";
    if (identity) {
      observations = ("Contrevenant : " + identity + (observations ? "\n" + observations : "")).trim();
    }
    fillField("observations", observations);

    const engineLabel =
      payload.engine === "ocr+ollama"
        ? "IA locale (Ollama)"
        : payload.engine === "ocr+openai"
          ? "IA (API)"
          : "OCR local";
    setStatus(
      engineLabel +
        " : " +
        (payload.filled_count || 0) +
        " champ(s) proposé(s). Vérifiez avant de créer le dossier.",
      "ok"
    );
  }

  function analyzeDocument(file) {
    if (!file) {
      return;
    }
    const communesNode = document.getElementById("communesJson");
    const formData = new FormData();
    formData.append("document", file);
    formData.append("communes", communesNode ? communesNode.textContent : "[]");

    setStatus("Lecture du document en cours…", "pending");
    if (dropzone) {
      dropzone.classList.add("is-busy");
    }

    fetch("script/script_analyse_document.php", {
      method: "POST",
      body: formData,
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || !data.success) {
            throw new Error(data.error || "Analyse impossible.");
          }
          return data;
        });
      })
      .then(applyExtractedFields)
      .catch(function (error) {
        setStatus(error.message, "error");
        Swal.fire({
          icon: "error",
          title: "Analyse impossible",
          text: error.message,
        });
      })
      .finally(function () {
        if (dropzone) {
          dropzone.classList.remove("is-busy");
        }
        if (fileInput) {
          fileInput.value = "";
        }
      });
  }

  if (pickButton && fileInput) {
    pickButton.addEventListener("click", function () {
      fileInput.click();
    });
    fileInput.addEventListener("change", function () {
      analyzeDocument(fileInput.files[0]);
    });
  }

  if (dropzone) {
    ["dragenter", "dragover"].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropzone.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropzone.classList.remove("is-dragover");
      });
    });
    dropzone.addEventListener("drop", function (event) {
      const file = event.dataTransfer && event.dataTransfer.files[0];
      analyzeDocument(file);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const numero = form.elements.numero_dossier.value.trim();
    if (!numero) {
      Swal.fire({
        icon: "error",
        title: "Champ obligatoire",
        text: "Veuillez renseigner le numéro de dossier.",
      });
      form.elements.numero_dossier.focus();
      return;
    }

    const formData = new FormData(form);
    if (submitButton) {
      submitButton.disabled = true;
    }

    fetch("script/script_creation_dossier.php", {
      method: "POST",
      body: formData,
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.error || "Erreur réseau");
          }
          return data;
        });
      })
      .then(function (data) {
        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Dossier créé",
            text: "Le dossier a été créé avec succès.",
            timer: 1400,
            showConfirmButton: false,
          }).then(function () {
            const targetId = data.id || "";
            window.location.href = targetId
              ? "details.php?id=" + encodeURIComponent(targetId) + "&type=dossier"
              : "../index.php";
          });
        } else {
          throw new Error(data.error || "Une erreur s'est produite lors de la création du dossier.");
        }
      })
      .catch(function (error) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: error.message,
        });
      })
      .finally(function () {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  });
});
