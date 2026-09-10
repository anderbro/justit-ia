document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchForm");
  const resultContainer = document.getElementById("resultContainer");
  let currentPage = 1;
  const resultsPerPage = 10;

  if (searchForm && resultContainer) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const searchKeyword = document.getElementById("search_keyword").value;

      if (searchKeyword.trim() !== "") {
        performSearch(searchKeyword, currentPage);
      } else {
        Swal.fire({
          icon: "info",
          title: "Champ de recherche vide",
          text: "Veuillez entrer un mot-clé pour effectuer la recherche.",
        });
      }
    });
  }

  function performSearch(searchKeyword, page) {
    fetch("./pages/script/script_recherche.php", {
      method: "POST",
      body: new URLSearchParams({
        search_keyword: searchKeyword,
        page: page,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resultContainer.innerHTML = "";

        if (data.results.length > 0) {
          const table = document.createElement("table");
          table.classList.add("table", "table-hover", "table-recherche");
          table.style.textAlign = "center";

          const thead = table.createTHead();
          const headerRow = thead.insertRow();

          function createHeaderCell(label, column) {
            const th = document.createElement("th");
            th.scope = "col";
            th.textContent = label;
            th.classList.add("sortable");
            th.setAttribute("data-column", column);
            th.style.cursor = "pointer";
            headerRow.appendChild(th);
            return th;
          }

          createHeaderCell("Numéro de Dossier", "num_dossier");
          createHeaderCell("Contrevenant", "contrevenant");
          createHeaderCell("Commune", "commune");
          createHeaderCell("Action", "action").classList.remove("sortable");

          const tbody = table.createTBody();
          data.results.forEach((item) => {
            const row = tbody.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            cell1.textContent = item.num_dossier || item.id_dossier;
            cell2.textContent = item.contrevenant || item.pv_contrevenant;
            cell3.textContent = item.commune;

            const viewButton = document.createElement("button");
            viewButton.classList.add("btn", "view-button");
            viewButton.textContent = "Voir";

            viewButton.addEventListener("click", function () {
              const dossierId = item.id_pv || item.id_dossier;
              const type = item.id_pv ? "pv" : "dossier";

              // Afficher l'id dans la console à des fins de débogage
              console.log("ID PV:", dossierId);

              // Transmettre l'identifiant et le type à details.php
              window.location.href =
                "pages/details.php?id=" + dossierId + "&type=" + type;
            });

            row.insertCell(3).appendChild(viewButton);
          });

          resultContainer.appendChild(table);

          enableSorting();
          displayPagination(data.totalResults);
        } else {
          Swal.fire({
            icon: "info",
            title: "Aucun résultat trouvé",
            text: "Aucun dossier correspondant à votre recherche.",
          });
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la requête AJAX : ", error);
        Swal.fire({
          icon: "error",
          title: "Erreur de recherche",
          text: "La requête de recherche ne génère aucun résultat.Veuillez réessayer.",
        });
      });
  }

  function enableSorting() {
    const thead = document.querySelector("thead");

    thead.addEventListener("click", function (event) {
      if (event.target.classList.contains("sortable")) {
        const columnIndex = event.target.cellIndex;
        sortTable(columnIndex);

        thead.querySelectorAll(".arrow").forEach((arrow) => {
          arrow.remove();
        });

        const arrow = document.createElement("span");
        arrow.classList.add("arrow");
        arrow.textContent = "▼";
        event.target.appendChild(arrow);
      }
    });
  }

  function sortTable(columnIndex) {
    const table = document.querySelector("table");
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.rows);

    // Exclure la dernière ligne de pagination du tri
    const paginationRow = rows.pop();

    rows.sort((a, b) => {
      const textA = a.cells[columnIndex].textContent.trim();
      const textB = b.cells[columnIndex].textContent.trim();

      if (columnIndex === 1) {
        const dateA = new Date(textA);
        const dateB = new Date(textB);
        return dateA - dateB;
      }

      return textA.localeCompare(textB);
    });

    const isSorted = table.querySelector(".sorted");
    if (isSorted && isSorted.cellIndex === columnIndex) {
      rows.reverse();
      table.querySelector(".sorted").classList.toggle("reversed");
    } else {
      table.querySelector(".sorted")?.classList.remove("sorted", "reversed");
      rows[0]?.cells[columnIndex]?.classList.add("sorted");
    }

    // Réinsérer la ligne de pagination après le tri
    tbody.innerHTML = "";
    rows.forEach((row) => {
      tbody.appendChild(row);
    });
    tbody.appendChild(paginationRow);
  }

  function displayPagination(totalResults) {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const paginationContainer = document.getElementById("paginationContainer");

    if (paginationContainer) {
      paginationContainer.remove();
    }

    const newPaginationContainer = document.createElement("div");
    newPaginationContainer.id = "paginationContainer";

    const visiblePages = 10;
    const halfVisiblePages = Math.floor(visiblePages / 2);

    if (currentPage > 1) {
      const prevButton = createPaginationButton("Précédent", currentPage - 1);
      newPaginationContainer.appendChild(prevButton);
    }

    let startPage = Math.max(1, currentPage - halfVisiblePages);
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage < visiblePages - 1) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    if (startPage > 1) {
      const firstButton = createPaginationButton(1, 1);
      newPaginationContainer.appendChild(firstButton);
      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        newPaginationContainer.appendChild(ellipsis);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = createPaginationButton(i, i);
      newPaginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        newPaginationContainer.appendChild(ellipsis);
      }
      const lastButton = createPaginationButton(totalPages, totalPages);
      newPaginationContainer.appendChild(lastButton);
    }

    if (currentPage < totalPages) {
      const nextButton = createPaginationButton("Suivant", currentPage + 1);
      newPaginationContainer.appendChild(nextButton);
    }

    const tableBody = resultContainer.querySelector("tbody");
    const tableRow = tableBody.insertRow();
    const paginationCell = tableRow.insertCell();
    paginationCell.colSpan = 4;
    paginationCell.classList.add("pagination-cell");
    paginationCell.appendChild(newPaginationContainer);
  }

  function createPaginationButton(label, targetPage) {
    const button = document.createElement("button");
    button.classList.add("btn", "pagination-button");
    button.textContent = label;

    button.addEventListener("click", function () {
      currentPage = targetPage;
      performSearch(
        document.getElementById("search_keyword").value,
        currentPage
      );
    });

    return button;
  }
});
