(function () {
  var modes = ["auto", "light", "dark"];
  var labels = {
    auto: "Auto",
    light: "Light",
    dark: "Dark"
  };
  var icons = {
    auto: "fa-circle-half-stroke",
    light: "fa-sun",
    dark: "fa-moon"
  };
  var storageKey = "theme-mode";
  var query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var button = document.querySelector("[data-theme-toggle]");

  function resolveTheme(mode) {
    if (mode === "dark" || mode === "light") return mode;
    return query && query.matches ? "dark" : "light";
  }

  function applyTheme(mode) {
    var safeMode = modes.indexOf(mode) === -1 ? "auto" : mode;
    var theme = resolveTheme(safeMode);
    document.documentElement.dataset.themeMode = safeMode;
    document.documentElement.dataset.theme = theme;

    if (!button) return;
    button.setAttribute("aria-label", "Theme: " + labels[safeMode]);
    button.title = "Theme: " + labels[safeMode];
    var label = button.querySelector("span");
    var icon = button.querySelector("i");
    if (label) label.textContent = labels[safeMode];
    if (icon) {
      icon.className = "fa-solid " + icons[safeMode];
      icon.setAttribute("aria-hidden", "true");
    }
  }

  function currentMode() {
    return localStorage.getItem(storageKey) || "auto";
  }

  if (button) {
    button.addEventListener("click", function () {
      var mode = currentMode();
      var nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
      localStorage.setItem(storageKey, nextMode);
      applyTheme(nextMode);
    });
  }

  if (query) {
    var onChange = function () {
      if (currentMode() === "auto") applyTheme("auto");
    };
    if (query.addEventListener) {
      query.addEventListener("change", onChange);
    } else if (query.addListener) {
      query.addListener(onChange);
    }
  }

  applyTheme(currentMode());
})();
