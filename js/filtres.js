document.addEventListener("DOMContentLoaded", function () {
  const detailsButton = document.getElementById("detailsButton");
  const bulle = document.getElementById("bulle");
  const filtreForm = document.getElementById("filtreForm");
  const resetButton = document.getElementById("filtreReset");

  if (!detailsButton || !bulle || !filtreForm) {
    return;
  }

  function fillSelect(select, items, valueKey, labelKey, emptyLabel) {
    const current = select.value;
    select.innerHTML = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = emptyLabel;
    select.appendChild(empty);

    items.forEach(function (item) {
      const option = document.createElement("option");
      if (typeof item === "object") {
        option.value = item[valueKey];
        option.textContent = item[labelKey];
      } else {
        option.value = item;
        option.textContent = item;
      }
      select.appendChild(option);
    });

    if (current) {
      select.value = current;
    }
  }

  function countActiveFilters() {
    const data = new FormData(filtreForm);
    let count = 0;
    data.forEach(function (value) {
      if (String(value).trim() !== "") {
        count += 1;
      }
    });
    return count;
  }

  function updateFilterButton() {
    const count = countActiveFilters();
    detailsButton.textContent = count > 0 ? "Filtres (" + count + ")" : "Filtres";
    detailsButton.classList.toggle("has-filters", count > 0);
  }

  function closeFilters() {
    bulle.classList.remove("is-open");
    bulle.style.display = "none";
    detailsButton.setAttribute("aria-expanded", "false");
  }

  function openFilters() {
    bulle.classList.add("is-open");
    bulle.style.display = "block";
    detailsButton.setAttribute("aria-expanded", "true");
  }

  detailsButton.setAttribute("aria-expanded", "false");
  detailsButton.setAttribute("aria-controls", "bulle");

  detailsButton.addEventListener("click", function (event) {
    event.stopPropagation();
    if (bulle.classList.contains("is-open")) {
      closeFilters();
    } else {
      openFilters();
    }
  });

  document.addEventListener("click", function (event) {
    if (!bulle.contains(event.target) && event.target !== detailsButton) {
      closeFilters();
    }
  });

  bulle.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  fetch("pages/script/script_filtres.php")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Erreur HTTP");
      }
      return response.json();
    })
    .then(function (data) {
      if (!data || data.error) {
        return;
      }
      fillSelect(
        document.getElementById("filtreCommune"),
        data.communes || [],
        null,
        null,
        "Toutes les communes"
      );
      fillSelect(
        document.getElementById("filtreAnnee"),
        data.annees || [],
        null,
        null,
        "Toutes les années"
      );
      fillSelect(
        document.getElementById("filtreContrevenant"),
        data.contrevenants || [],
        "id_contrevenant",
        "label",
        "Tous les contrevenants"
      );
      fillSelect(
        document.getElementById("filtrePriorite"),
        data.priorites || [],
        null,
        null,
        "Toutes les priorités"
      );
    })
    .catch(function (error) {
      console.error("Impossible de charger les propositions de filtres :", error);
    });

  filtreForm.addEventListener("submit", function (event) {
    event.preventDefault();
    updateFilterButton();
    if (typeof window.loadDossiers === "function") {
      window.loadDossiers();
    }
    closeFilters();
  });

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      filtreForm.reset();
      updateFilterButton();
      if (typeof window.loadDossiers === "function") {
        window.loadDossiers();
      }
    });
  }

  filtreForm.addEventListener("change", updateFilterButton);
  updateFilterButton();
});
