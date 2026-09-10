function redirectToDetails(dossierId) {
  window.location.href = "pages/details.php?id=" + dossierId + "&type=dossier";
}

function formatDateFr(value) {
  if (!value) {
    return "—";
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    return match[3] + "/" + match[2] + "/" + match[1];
  }
  return value;
}

function getDossierQueryParams() {
  const params = new URLSearchParams();
  const form = document.getElementById("filtreForm");
  if (form) {
    const data = new FormData(form);
    data.forEach(function (value, key) {
      if (String(value).trim() !== "") {
        params.set(key, value);
      }
    });
  }
  const searchInput = document.getElementById("search_keyword");
  if (searchInput && searchInput.value.trim() !== "") {
    params.set("q", searchInput.value.trim());
  }
  return params;
}

function renderDossierTable(dossiers) {
  const resultContainer = document.getElementById("resultContainer");
  if (!resultContainer) {
    return;
  }

  resultContainer.innerHTML = "";

  if (!dossiers || dossiers.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-results";
    empty.textContent = "Aucun dossier ne correspond à ces critères.";
    resultContainer.appendChild(empty);
    return;
  }

  const table = document.createElement("table");
  table.classList.add("table", "table-hover");
  table.style.textAlign = "center";

  const thead = table.createTHead();
  const headerRow = thead.insertRow();

  function createHeaderCell(label, column, sortable) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = label;
    th.setAttribute("data-column", column);
    if (sortable) {
      th.classList.add("sortable");
      th.style.cursor = "pointer";
    }
    headerRow.appendChild(th);
  }

  createHeaderCell("Numéro de dossier", "num_dossier", true);
  createHeaderCell("Contrevenant", "contrevenant", true);
  createHeaderCell("Commune", "commune", true);
  createHeaderCell("Date", "date_du_soit_transmis", true);
  createHeaderCell("Action", "action", false);

  const tbody = table.createTBody();

  dossiers.forEach(function (dossier) {
    const row = tbody.insertRow();
    row.insertCell(0).textContent = dossier.num_dossier || "—";
    row.insertCell(1).textContent = dossier.contrevenant || "—";
    row.insertCell(2).textContent = dossier.commune || "—";
    row.insertCell(3).textContent = formatDateFr(dossier.date_du_soit_transmis);

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.classList.add("btn", "view-button");
    viewButton.textContent = "Voir";
    viewButton.addEventListener("click", function () {
      redirectToDetails(dossier.id_dossier);
    });
    row.insertCell(4).appendChild(viewButton);
  });

  resultContainer.appendChild(table);
  enableSorting(table);
}

function enableSorting(table) {
  const thead = table.querySelector("thead");
  if (!thead) {
    return;
  }

  thead.addEventListener("click", function (event) {
    if (!event.target.classList.contains("sortable")) {
      return;
    }
    sortTable(table, event.target.cellIndex);
  });
}

function sortTable(table, columnIndex) {
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.rows);

  rows.sort(function (a, b) {
    const textA = a.cells[columnIndex].textContent.trim();
    const textB = b.cells[columnIndex].textContent.trim();

    if (columnIndex === 3) {
      const toTime = function (value) {
        const parts = value.split("/");
        if (parts.length === 3) {
          return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
        }
        return 0;
      };
      return toTime(textA) - toTime(textB);
    }

    return textA.localeCompare(textB, "fr", { numeric: true, sensitivity: "base" });
  });

  const current = table.querySelector("th.sorted");
  if (current && current.cellIndex === columnIndex) {
    rows.reverse();
    current.classList.toggle("reversed");
  } else {
    table.querySelectorAll("th.sorted, th.reversed").forEach(function (cell) {
      cell.classList.remove("sorted", "reversed");
    });
    table.querySelectorAll("th")[columnIndex].classList.add("sorted");
  }

  tbody.innerHTML = "";
  rows.forEach(function (row) {
    tbody.appendChild(row);
  });
}

function loadDossiers() {
  const resultContainer = document.getElementById("resultContainer");
  if (!resultContainer) {
    return Promise.resolve();
  }

  const params = getDossierQueryParams();
  const query = params.toString();
  const url = "pages/script/script_accueil.php" + (query ? "?" + query : "");

  return fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Erreur HTTP, statut : " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (data && data.error) {
        throw new Error(data.error);
      }
      renderDossierTable(Array.isArray(data) ? data : []);
    })
    .catch(function (error) {
      console.error("Erreur lors de la requête AJAX : ", error);
      resultContainer.innerHTML = "";
      const empty = document.createElement("p");
      empty.className = "empty-results";
      empty.textContent = "Erreur lors de la récupération des dossiers.";
      resultContainer.appendChild(empty);
    });
}

window.loadDossiers = loadDossiers;

document.addEventListener("DOMContentLoaded", function () {
  loadDossiers();

  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      loadDossiers();
    });
  }

  const createButton = document.getElementById("createDossierButton");
  if (createButton) {
    createButton.addEventListener("click", function () {
      window.location.href = "./pages/creation.php";
    });
  }
});
