// Project screenshots open in a modal instead of a new tab: arrow keys and
// swipes move between them, Escape or a click outside the picture closes it.
// The links keep their href, so without JavaScript they still open the image.

import { t } from "./i18n.js";

export function initLightbox() {
  const links = [...document.querySelectorAll(".gallery a.browser")];
  if (!links.length) return;

  const items = links.map((a) => ({
    src: a.getAttribute("href"),
    alt: a.querySelector("img")?.alt || "",
    caption: a.closest("figure")?.querySelector("figcaption")?.textContent.trim() || "",
  }));

  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", t("screenshots"));
  dialog.innerHTML = `
    <figure class="lightbox-figure">
      <img class="lightbox-img" alt="">
      <figcaption class="lightbox-caption"><span class="lightbox-text"></span><span class="lightbox-count"></span></figcaption>
    </figure>
    <button type="button" class="lightbox-btn lightbox-close" aria-label="${t("close")}">×</button>
    <button type="button" class="lightbox-btn lightbox-prev" aria-label="${t("previous")}">‹</button>
    <button type="button" class="lightbox-btn lightbox-next" aria-label="${t("next")}">›</button>`;
  document.body.append(dialog);

  const img = dialog.querySelector(".lightbox-img");
  const text = dialog.querySelector(".lightbox-text");
  const count = dialog.querySelector(".lightbox-count");
  let index = 0;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const item = items[index];
    img.src = item.src;
    img.alt = item.alt;
    text.textContent = item.caption;
    count.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : "";
  };

  links.forEach((a, i) =>
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" through
      e.preventDefault();
      show(i);
      dialog.showModal();
    }),
  );

  dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".lightbox-prev").addEventListener("click", () => show(index - 1));
  dialog.querySelector(".lightbox-next").addEventListener("click", () => show(index + 1));
  // a click on the dark backdrop (the dialog itself, not its picture or buttons) closes it
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.classList.contains("lightbox-figure")) dialog.close();
  });
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  let startX = null;
  dialog.addEventListener("pointerdown", (e) => { startX = e.clientX; });
  dialog.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
  if (items.length < 2) dialog.classList.add("is-single");
}
