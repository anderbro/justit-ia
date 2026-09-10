document.addEventListener("DOMContentLoaded", function () {
    const dossierId = new URLSearchParams(window.location.search).get("id");

    // Charger les décisions pour le dossier
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
        console.log(data);
        if (data && Array.isArray(data.decisions)) {
            const decisionContainer = document.getElementById("decisionContainer");

            data.decisions.forEach((decision) => {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = `decision-${decision.id_decision}`;
                checkbox.name = "decisions";
                checkbox.value = decision.id_decision;

                const label = document.createElement("label");
                label.htmlFor = `decision-${decision.id_decision}`;
                const prenom = decision.prenom ? decision.prenom : "";
                label.innerText = `${decision.nom} ${prenom}`.trim();

                const decisionDiv = document.createElement("div");
                decisionDiv.appendChild(checkbox);
                decisionDiv.appendChild(label);

                decisionContainer.appendChild(decisionDiv);
            });
        } else {
            console.error("Aucune décision trouvée pour ce dossier.");
        }
    })
    .catch((error) => {
        console.error("Erreur lors de la récupération des décisions :", error);
    });

    // Gérer la soumission des décisions sélectionnées
    const submitButton = document.getElementById("submitButton");
    submitButton.addEventListener("click", function () {
        const selectedDecisions = Array.from(document.querySelectorAll("input[name='decisions']:checked"))
            .map(checkbox => checkbox.value);

        if (selectedDecisions.length > 0) {
            // Traiter les décisions sélectionnées (par exemple, envoyer au serveur)
            const formData = new FormData();
            formData.append("decisions", JSON.stringify(selectedDecisions));

            fetch(`../pages/script/execution/script_execution.php?id=${dossierId}`, {
                method: "POST",
                body: formData,
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erreur HTTP, statut : " + response.status);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.status === "success") {
                    Swal.fire({
                        icon: "success",
                        title: "Succès",
                        text: data.message,
                        confirmButtonText: "OK",
                    }).then(() => {
                        location.reload(); // Rafraîchir la page
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Erreur",
                        text: data.message,
                    });
                }
            })
            .catch((error) => {
                console.error("Erreur lors de l'envoi des décisions sélectionnées :", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur",
                    text: "Erreur lors de l'envoi des décisions sélectionnées.",
                });
            });
        } else {
            Swal.fire({
                icon: "warning",
                title: "Attention",
                text: "Veuillez sélectionner au moins une décision.",
            });
        }
    });
});
