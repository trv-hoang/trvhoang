// Keeps the Giscus comment frame in the site's theme.

import { isDark, THEME_EVENT } from "./theme.js";

function send(theme) {
  const frame = document.querySelector("iframe.giscus-frame");
  frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, "https://giscus.app");
}

export function initGiscus() {
  if (!document.querySelector(".giscus")) return;

  window.addEventListener(THEME_EVENT, (e) => send(e.detail.dark ? "dark" : "light"));

  // the first message from the frame means it is ready to be themed
  window.addEventListener("message", function onReady(e) {
    if (e.origin !== "https://giscus.app" || !e.data?.giscus) return;
    send(isDark() ? "dark" : "light");
    window.removeEventListener("message", onReady);
  });
}
