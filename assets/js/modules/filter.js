// In-page filtering for lists (projects by kind, blog posts by tag).
//
// Markup:
//   <div data-filter="posts" data-filter-param="tag">           the group; param is the ?query name
//     <button data-filter-value="all" aria-pressed="true">…     one per option ("all" shows everything)
//   <li data-filter-item="posts" data-filter-keys="go web">…    items, keys separated by spaces
//   <p data-filter-empty="posts" hidden>…                       optional empty state
//   <span data-filter-count="posts">                            optional "n shown" text
//
// The choice is kept in the URL (?tag=go), so a filtered list can be shared
// and the back button works.

export function initFilters() {
  document.querySelectorAll("[data-filter]").forEach((group) => {
    const name = group.dataset.filter;
    const param = group.dataset.filterParam || "filter";
    const buttons = [...group.querySelectorAll("[data-filter-value]")];
    const items = [...document.querySelectorAll(`[data-filter-item="${name}"]`)];
    const empty = document.querySelector(`[data-filter-empty="${name}"]`);
    const count = document.querySelector(`[data-filter-count="${name}"]`);

    function apply(value, { push = false } = {}) {
      if (!buttons.some((b) => b.dataset.filterValue === value)) value = "all";
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filterValue === value)));

      let shown = 0;
      items.forEach((item) => {
        const keys = (item.dataset.filterKeys || "").split(" ");
        const ok = value === "all" || keys.includes(value);
        item.hidden = !ok;
        if (ok) {
          shown++;
          // replay the entrance so the change reads as a change
          item.classList.remove("is-in");
          requestAnimationFrame(() => item.classList.add("is-in"));
        }
      });
      if (empty) empty.hidden = shown > 0;
      if (count) count.textContent = String(shown);

      // hide headings of sections left with nothing in them
      document.querySelectorAll(`[data-filter-section="${name}"]`).forEach((section) => {
        section.hidden = !section.querySelector(`[data-filter-item="${name}"]:not([hidden])`);
      });

      const url = new URL(location.href);
      if (value === "all") url.searchParams.delete(param);
      else url.searchParams.set(param, value);
      history[push ? "pushState" : "replaceState"]({}, "", url);
    }

    buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.filterValue, { push: true })));
    window.addEventListener("popstate", () => apply(new URL(location.href).searchParams.get(param) || "all"));
    apply(new URL(location.href).searchParams.get(param) || "all");
  });
}
