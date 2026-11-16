// Mobile menu: open, close on outside click, Escape or navigation.
// Desktop pill: slides to the clicked link on the current page, then the
// browser navigates. Every page renders the pill under its own link, so the
// next page opens with the pill already there. This does not depend on
// cross-document view transitions, which some browsers skip or do not have.

import { t } from "./i18n.js";

const PILL_MS = 340;
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function initPill() {
  const bar = document.querySelector(".nav-desktop");
  if (!bar) return;
  const links = [...bar.querySelectorAll("a.nav-link")];
  const home = links.find((a) => a.getAttribute("aria-current") === "page");

  // start loading the next page while the pill is still moving
  const prefetched = new Set();
  const prefetch = (href) => {
    if (prefetched.has(href)) return;
    prefetched.add(href);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.append(link);
  };

  let leaving = false;
  links.forEach((a) => {
    a.addEventListener("pointerenter", () => prefetch(a.href));
    a.addEventListener("pointerdown", () => prefetch(a.href));
    a.addEventListener("focus", () => prefetch(a.href));
    a.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const pill = bar.querySelector(".nav-pill");
      if (!pill || a === home || reduceMotion() || getComputedStyle(bar).display === "none") return;
      e.preventDefault();
      if (leaving) return;
      leaving = true;

      const from = pill.getBoundingClientRect();
      const to = a.getBoundingClientRect();
      home?.removeAttribute("aria-current");
      a.setAttribute("aria-current", "page");
      const go = () => location.assign(a.href);
      const move = pill.animate(
        [
          { transform: "translateX(0)", width: `${from.width}px` },
          { transform: `translateX(${to.left - from.left}px)`, width: `${to.width}px` },
        ],
        { duration: PILL_MS, easing: "cubic-bezier(0.34, 1.3, 0.64, 1)", fill: "forwards" },
      );
      move.finished.then(go, go);
      setTimeout(go, PILL_MS + 150); // in case the animation never reports back
    });
  });

  // coming back through the back/forward cache: undo the slide
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    bar.querySelector(".nav-pill")?.getAnimations().forEach((anim) => anim.cancel());
    links.forEach((a) => a.toggleAttribute("aria-current", false));
    home?.setAttribute("aria-current", "page");
  });
}

export function initNav() {
  initPill();
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
