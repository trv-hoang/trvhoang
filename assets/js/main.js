// Site entry point, bundled by Hugo (js.Build) in layouts/partials/site/scripts.html.
// Each module finds its own elements and does nothing when they are absent,
// so every page loads the same bundle.

import { initTheme } from "./modules/theme.js";
import { initNav } from "./modules/nav.js";
import { initConstellation } from "./modules/constellation.js";
import { initReveal } from "./modules/reveal.js";
import { initMap } from "./modules/map.js";
import { initGiscus } from "./modules/giscus.js";
import { initFilters } from "./modules/filter.js";
import { initContact } from "./modules/contact.js";
import { initLightbox } from "./modules/lightbox.js";

initTheme();
initNav();
initConstellation();
initReveal();
initMap();
initGiscus();
initFilters();
initContact();
initLightbox();
