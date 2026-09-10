(function patchDossierFormModals() {
  if (!window.Swal || Swal.__justitFormPatch) {
    return;
  }

  const originalFire = Swal.fire.bind(Swal);
  const LARGE_FORM_CLASSES = [
    "decision-form",
    "infraction-form",
    "parquet-form",
  ];
  const SECTION_TITLES = {
    "decision-form": ["Décision", "Peines et mesures", "Notification"],
    "infraction-form": ["Infraction"],
    "parquet-form": ["Parquet"],
  };

  function isFormModal(options) {
    const html = options && options.html;
    if (!html || html.nodeType !== 1) {
      return false;
    }
    return (
      html.classList.contains("popup-form") ||
      html.querySelector(".popup-form") !== null
    );
  }

  function isControl(el) {
    if (!el || el.nodeType !== 1) {
      return false;
    }
    const tag = el.tagName;
    if (tag === "INPUT" && el.type === "hidden") {
      return false;
    }
    return tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA";
  }

  function isCheckbox(el) {
    return el && el.tagName === "INPUT" && (el.type === "checkbox" || el.type === "radio");
  }

  function isLabel(el) {
    return el && (el.tagName === "LABEL" || el.tagName === "LABELFORM");
  }

  function linkLabel(label, control) {
    if (!label || label.tagName !== "LABEL" || !control) {
      return;
    }
    if (!control.id) {
      control.id = (control.name || "champ") + "-" + Math.random().toString(36).slice(2, 8);
    }
    label.htmlFor = control.id;
    label.textContent = label.textContent.replace(/\s*:\s*$/, "");
  }

  function wrapPair(container, first, second, checkbox) {
    const field = document.createElement("div");
    field.className = "popup-field";
    const control = isControl(first) ? first : second;
    const label = isLabel(first) ? first : second;
    const name = ((control && control.getAttribute("name")) || "").toLowerCase();

    container.insertBefore(field, first);
    if (checkbox) {
      field.classList.add("popup-field--check");
      field.appendChild(control);
      field.appendChild(label);
    } else {
      if (control.tagName === "TEXTAREA" || /adresse|obs|observation|objet|suites/.test(name)) {
        field.classList.add("popup-field--wide");
      }
      field.appendChild(label);
      field.appendChild(control);
    }
    linkLabel(label, control);
    return field;
  }

  function wrapFields(container) {
    if (!container || container.dataset.fieldsWrapped === "1") {
      return;
    }

    Array.from(container.children).forEach(function (child) {
      if (
        child.tagName === "DIV" &&
        !child.classList.contains("popup-field") &&
        !child.classList.contains("popup-actions") &&
        !child.classList.contains("natinf-container") &&
        !child.classList.contains("natinf-group")
      ) {
        wrapFields(child);
      }
    });

    let node = container.firstElementChild;
    while (node) {
      const next = node.nextElementSibling;
      if (isLabel(node) && isControl(next)) {
        const field = wrapPair(container, node, next, isCheckbox(next));
        node = field.nextElementSibling;
        continue;
      }
      if (isCheckbox(node) && isLabel(next)) {
        const field = wrapPair(container, node, next, true);
        node = field.nextElementSibling;
        continue;
      }
      node = next;
    }

    const children = Array.from(container.children);
    let start = children.length;
    while (start > 0 && children[start - 1].tagName === "BUTTON") {
      start -= 1;
    }
    if (start < children.length) {
      const actions = document.createElement("div");
      actions.className = "popup-actions";
      children.slice(start).forEach(function (btn) {
        btn.type = "button";
        btn.classList.add("popup-btn");
        if (/fermer|annuler/i.test(btn.textContent)) {
          btn.classList.add("popup-btn--ghost");
        }
        actions.appendChild(btn);
      });
      container.appendChild(actions);
    }

    container.dataset.fieldsWrapped = "1";
  }

  function decorateLargeForm(form) {
    const isNamedLarge = LARGE_FORM_CLASSES.some(function (name) {
      return form.classList.contains(name);
    });
    const fieldCount = form.querySelectorAll(".popup-field").length;
    if (!isNamedLarge && fieldCount < 10) {
      return;
    }

    form.classList.add("popup-form--large");

    const key = LARGE_FORM_CLASSES.find(function (name) {
      return form.classList.contains(name);
    });
    const titles = SECTION_TITLES[key] || [];

    form.querySelectorAll(".form-section").forEach(function (section, index) {
      const existing = section.querySelector(":scope > h1, :scope > h2, :scope > .form-section-title, :scope > .popup-title");
      if (existing) {
        existing.classList.add("form-section-title");
        existing.classList.remove("popup-title");
        if (titles[index]) {
          existing.textContent = titles[index];
        }
      } else if (titles[index]) {
        const heading = document.createElement("h3");
        heading.className = "form-section-title";
        heading.textContent = titles[index];
        section.insertBefore(heading, section.firstChild);
      }
    });
  }

  function modernizeForm(root) {
    const form = root.classList.contains("popup-form")
      ? root
      : root.querySelector(".popup-form");
    if (!form) {
      return form;
    }
    wrapFields(form);
    form.classList.add("popup-form--modern");
    const title = form.querySelector(":scope > labelForm, :scope > h1, :scope > h2, :scope > .popup-title");
    if (title) {
      title.classList.add("popup-title");
    }
    decorateLargeForm(form);
    return form;
  }

  Swal.fire = function () {
    const args = Array.prototype.slice.call(arguments);
    const options = args[0];

    if (args.length === 1 && options && typeof options === "object" && isFormModal(options)) {
      const previousDidOpen = options.didOpen;
      const extraPopupClass =
        (options.customClass && options.customClass.popup) || "";

      options.width = "780px";
      options.showCloseButton = true;
      options.customClass = Object.assign({}, options.customClass, {
        popup: (extraPopupClass + " swal-form-popup").trim(),
        htmlContainer: "swal-form-html",
        closeButton: "swal-form-close",
      });
      options.didOpen = function () {
        const popup = Swal.getPopup();
        if (popup) {
          popup.classList.add("swal-form-popup");
        }
        const form =
          options.html && options.html.nodeType === 1
            ? modernizeForm(options.html)
            : null;
        if (popup && form && form.classList.contains("popup-form--large")) {
          popup.classList.add("swal-form-popup--large");
          popup.style.setProperty("width", "min(1100px, 96vw)", "important");
        }
        if (typeof previousDidOpen === "function") {
          previousDidOpen.apply(this, arguments);
        }
      };
    }

    return originalFire.apply(Swal, args);
  };

  Swal.__justitFormPatch = true;
})();
