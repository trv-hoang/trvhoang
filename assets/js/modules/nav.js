// Mobile menu: open, close on outside click, Escape or navigation.
// The active-tab pill needs no script: it is rendered under the current
// link and moves between pages through a view transition (motion.css).

import { t } from "./i18n.js";

export function initNav() {
  const button = document.querySelector("[data-menu-button]");
  const menu = document.getElementById("mobile-menu");
  if (!button || !menu) return;

  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? t("menu_close") : t("menu_open"));
    menu.dataset.open = String(open);
    menu.inert = !open;
  };
  setOpen(false);

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(menu.dataset.open !== "true");
  });

  document.addEventListener("click", (e) => {
    if (menu.dataset.open === "true" && !menu.contains(e.target)) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.dataset.open === "true") {
      setOpen(false);
      button.focus();
    }
  });

  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));

  // close it when the viewport grows past the mobile breakpoint
  matchMedia("(min-width: 40rem)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });

  // a page restored from the back/forward cache comes back with the menu closed
  window.addEventListener("pageshow", () => setOpen(false));
}
