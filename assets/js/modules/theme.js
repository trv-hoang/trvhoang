// Light / dark theme.
// The first paint is set by the inline script in partials/site/head.html;
// this module wires the toggle buttons and broadcasts changes.

export const THEME_EVENT = "themechange";

export function isDark() {
  return document.documentElement.classList.contains("dark");
}

function apply(dark) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0c0a09" : "#f5f5f4");
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { dark } }));
}

// A circular wipe from the button that was pressed, where the browser supports it.
function switchWithWipe(button) {
  const next = !isDark();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) {
    apply(next);
    return;
  }
  const root = document.documentElement;
  const r = button.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  root.style.setProperty("--wipe-x", `${x}px`);
  root.style.setProperty("--wipe-y", `${y}px`);
  root.style.setProperty("--wipe-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  root.classList.add("theme-switching");
  const transition = document.startViewTransition(() => apply(next));
  transition.finished.finally(() => root.classList.remove("theme-switching"));
}

export function initTheme() {
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => switchWithWipe(button));
  });

  // Follow the system setting until the visitor picks one.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let saved = null;
    try {
      saved = localStorage.getItem("theme");
    } catch {}
    if (!saved) apply(e.matches);
  });
}
