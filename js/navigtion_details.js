document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".menu-detail button");
  const panels = document.querySelectorAll(".rightpart > .content");

  function showPanel(divId) {
    buttons.forEach(function (button) {
      const isActive = "div" + button.id.charAt(0).toUpperCase() + button.id.slice(1) === divId;
      button.classList.toggle("active", isActive);
    });

    panels.forEach(function (panel) {
      panel.classList.toggle("is-visible", panel.id === divId);
      panel.style.removeProperty("display");
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const divId = "div" + this.id.charAt(0).toUpperCase() + this.id.slice(1);
      const targetDiv = document.getElementById(divId);
      if (!targetDiv) {
        console.error("No div found for the id: " + divId);
        return;
      }
      showPanel(divId);
    });
  });

  const initiallyVisible = document.querySelector(".rightpart > .content.is-visible");
  if (initiallyVisible) {
    showPanel(initiallyVisible.id);
  }
});
