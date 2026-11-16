// Interface text for the scripts, in the page's language.
// The strings come from i18n/*.yaml (keys js_*) via <script id="i18n"> in
// partials/site/scripts.html. Placeholders look like {name}.

let strings = null;

export function t(key, vars = {}) {
  if (!strings) {
    try {
      strings = JSON.parse(document.getElementById("i18n")?.textContent || "{}");
    } catch {
      strings = {};
    }
  }
  const text = strings[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? vars[name] : `{${name}}`));
}

export const lang = () => document.documentElement.lang || "en";
