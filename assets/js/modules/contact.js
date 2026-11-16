// Contact page: copy the email address, and show the time in Hanoi.

import { t, lang } from "./i18n.js";

export function initContact() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    const label = button.querySelector("[data-copy-label]");
    const original = label?.textContent;
    let timer;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.dataset.state = "copied";
        if (label) label.textContent = t("copied");
      } catch {
        // clipboard blocked: fall back to opening the mail app
        location.href = `mailto:${button.dataset.copy}`;
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.dataset.state = "";
        if (label) label.textContent = original;
      }, 1800);
    });
  });

  const clock = document.querySelector("[data-local-time]");
  if (clock) {
    const format = new Intl.DateTimeFormat(lang() === "vi" ? "vi-VN" : "en-GB", {
      timeZone: clock.dataset.localTime,
      hour: "2-digit",
      minute: "2-digit",
    });
    const tick = () => {
      clock.textContent = format.format(new Date());
    };
    tick();
    setInterval(tick, 15000);
  }
}
