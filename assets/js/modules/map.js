// The /map/ page: a MapLibre vector map with one pin per place, toolbar filters,
// "Surprise me", and the paginated list of places under the map.
// Places, colours and style URLs arrive as JSON in <script id="map-data">
// (partials/map/map.html); each popup is pre-rendered HTML from partials/map/popup.html.

import { isDark, THEME_EVENT } from "./theme.js";
import { t, lang } from "./i18n.js";

const SOURCE = "places";
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const pageSize = () => (matchMedia("(min-width: 64rem)").matches ? 12 : matchMedia("(min-width: 40rem)").matches ? 10 : 8);

// page numbers with gaps: 1 … 4 5 6 … 20
function pageList(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const list = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  list.forEach((n, i) => {
    if (i && n - list[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

function boundsOf(points) {
  const lngs = points.map((p) => p.lng);
  const lats = points.map((p) => p.lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export function initMap() {
  const el = document.getElementById("map");
  const dataEl = document.getElementById("map-data");
  const ml = window.maplibregl;
  if (!el || !dataEl || !ml) return;

  const { places, colours, styles, surpriseMascot } = JSON.parse(dataEl.textContent);
  const colourOf = (cat) => colours[cat] || colours.default;
  const styleUrl = () => new URL(isDark() ? styles.dark : styles.light, location.href).href;

  // open on the city with the most places rather than the whole world
  const byCity = {};
  places.forEach((p) => (byCity[p.city] ||= []).push(p));
  const home = Object.values(byCity).sort((a, b) => b.length - a.length)[0] || places;

  const map = new ml.Map({
    container: el,
    style: styleUrl(),
    bounds: home.length ? boundsOf(home) : undefined,
    fitBoundsOptions: { padding: 32, maxZoom: 14 },
    attributionControl: { compact: true },
    cooperativeGestures: matchMedia("(pointer: coarse)").matches,
    dragRotate: false,
    pitchWithRotate: false,
    locale: {
      "GeolocateControl.FindMyLocation": t("find_me"),
      "GeolocateControl.LocationNotAvailable": t("location_unavailable"),
    },
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");

  // the locate button follows the visitor; the dot itself is our own marker
  // (setHere below), so Surprise me can show it too without moving the camera
  const geolocate = new ml.GeolocateControl({
    positionOptions: { enableHighAccuracy: true, timeout: 15000 },
    fitBoundsOptions: { maxZoom: 15 },
    trackUserLocation: true,
    showUserLocation: false,
  });
  map.addControl(geolocate, "bottom-right");

  // a failed lookup leaves the button half-lit and says nothing, so say why
  const toast = document.createElement("p");
  toast.className = "map-toast";
  toast.setAttribute("role", "status");
  el.appendChild(toast);
  let toastTimer;
  const showToast = (text) => {
    toast.textContent = text;
    toast.dataset.show = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.dataset.show = "false"), 7000);
  };
  const locateError = (e) =>
    t(e?.code === 1 ? "locate_denied" : e?.code === 3 ? "locate_timeout" : "locate_unavailable");
  geolocate.on("error", (e) => showToast(locateError(e)));

  // always above its pin; once open, the map slides so the whole card is inside the frame
  const popup = new ml.Popup({ className: "map-popup", maxWidth: "300px", offset: 14, anchor: "bottom", focusAfterOpen: false });
  popup.on("open", () =>
    requestAnimationFrame(() => {
      const card = popup.getElement()?.getBoundingClientRect();
      const frame = el.getBoundingClientRect();
      if (!card) return;
      const pad = 12;
      let dx = 0;
      let dy = 0;
      if (card.top < frame.top + pad) dy = card.top - frame.top - pad;
      if (card.left < frame.left + pad) dx = card.left - frame.left - pad;
      else if (card.right > frame.right - pad) dx = card.right - frame.right + pad;
      if (dx || dy) map.panBy([dx, dy], { duration: reduceMotion() ? 0 : 350 });
    }),
  );

  // ── data and layers ───────────────────────────────────────────
  let visible = places.map((_, i) => i);
  const geojson = () => ({
    type: "FeatureCollection",
    features: visible.map((i) => ({
      type: "Feature",
      id: i,
      geometry: { type: "Point", coordinates: [places[i].lng, places[i].lat] },
      properties: { i, colour: colourOf(places[i].category), closed: Boolean(places[i].status) },
    })),
  });

  function addLayers() {
    const ring = isDark() ? "#0f1115" : "#ffffff";
    map.addSource(SOURCE, { type: "geojson", data: geojson() });
    // every place is its own pin; pins shrink as the map zooms out so a whole city stays readable
    map.addLayer({
      id: "points",
      type: "circle",
      source: SOURCE,
      paint: {
        "circle-color": ["get", "colour"],
        "circle-radius": [
          "interpolate", ["linear"], ["zoom"],
          6, ["case", ["boolean", ["feature-state", "hot"], false], 5, 2.5],
          11, ["case", ["boolean", ["feature-state", "hot"], false], 7, 4],
          14, ["case", ["boolean", ["feature-state", "hot"], false], 10, 6.5],
          17, ["case", ["boolean", ["feature-state", "hot"], false], 12, 8.5],
        ],
        "circle-radius-transition": { duration: 180 },
        "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 6, 0.8, 13, 2, 16, 2.5],
        "circle-stroke-color": ring,
        // a place that has closed stays on the map, faded
        "circle-opacity": ["case", ["get", "closed"], 0.4, 1],
        "circle-stroke-opacity": ["case", ["get", "closed"], 0.5, 1],
      },
    });
  }

  map.on("style.load", addLayers);

  // follow the site theme: swap the style, then put our layers back
  window.addEventListener(THEME_EVENT, () => {
    popup.remove();
    map.setStyle(styleUrl(), { diff: false });
  });

  // ── pointer ───────────────────────────────────────────────────
  map.on("mouseenter", "points", () => (map.getCanvas().style.cursor = "pointer"));
  map.on("mouseleave", "points", () => (map.getCanvas().style.cursor = ""));

  // "Surprise me" results get a fox and a line above the usual popup
  const surpriseBanner = (text) =>
    `<div class="map-popup-surprise">${surpriseMascot ? `<img src="${surpriseMascot}" alt="" width="56" height="56">` : ""}<span>${text}</span></div>`;
  const openPopup = (i, banner = "") =>
    popup.setLngLat([places[i].lng, places[i].lat]).setHTML((banner ? surpriseBanner(banner) : "") + places[i].popup).addTo(map);
  map.on("click", "points", (e) => openPopup(e.features[0].properties.i));

  function focus(i, banner = "") {
    el.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
    // land the pin low in the frame so the card above it has room
    map.flyTo({ center: [places[i].lng, places[i].lat], zoom: 16.5, offset: [0, el.clientHeight * 0.28], duration: reduceMotion() ? 0 : 1200, essential: true });
    map.once("moveend", () => openPopup(i, banner));
  }

  // ── filters ───────────────────────────────────────────────────
  const state = { search: "", category: "all", city: "all", page: 1 };
  const items = [...document.querySelectorAll("[data-place-item]")];
  const pager = document.getElementById("places-pages");
  const empty = document.getElementById("places-empty");
  const count = document.getElementById("places-count");
  const listTop = document.getElementById("places");

  const matches = (p) =>
    (!state.search ||
      p.name.toLowerCase().includes(state.search) ||
      p.city.toLowerCase().includes(state.search) ||
      p.address.toLowerCase().includes(state.search)) &&
    (state.category === "all" || p.category === state.category) &&
    (state.city === "all" || p.city === state.city);

  function renderList() {
    const size = pageSize();
    const pages = Math.max(1, Math.ceil(visible.length / size));
    state.page = Math.min(state.page, pages);
    const from = (state.page - 1) * size;
    const onPage = new Set(visible.slice(from, from + size));

    items.forEach((li) => {
      const show = onPage.has(Number(li.dataset.placeItem));
      li.hidden = !show;
      if (show) {
        li.classList.remove("is-shown");
        requestAnimationFrame(() => li.classList.add("is-shown"));
      }
    });

    empty.hidden = visible.length > 0;
    count.textContent =
      visible.length === 0
        ? t("places_none")
        : visible.length === 1
          ? t("places_one")
          : t("places_range", { from: from + 1, to: Math.min(from + size, visible.length), total: visible.length });

    pager.hidden = pages <= 1;
    pager.innerHTML = "";
    if (pages <= 1) return;

    const button = (label, page, { current = false, disabled = false, aria } = {}) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "page-btn";
      b.textContent = label;
      if (aria) b.setAttribute("aria-label", aria);
      if (current) b.setAttribute("aria-current", "page");
      b.disabled = disabled;
      b.addEventListener("click", () => goTo(page));
      return b;
    };
    pager.append(button(t("previous"), state.page - 1, { disabled: state.page === 1, aria: t("previous_page") }));
    const numbers = document.createElement("div");
    numbers.className = "page-numbers";
    pageList(state.page, pages).forEach((n) => {
      if (n === "gap") {
        const s = document.createElement("span");
        s.className = "page-gap";
        s.textContent = "…";
        numbers.append(s);
      } else numbers.append(button(String(n), n, { current: n === state.page, aria: t("page", { n }) }));
    });
    pager.append(numbers);
    pager.append(button(t("next"), state.page + 1, { disabled: state.page === pages, aria: t("next_page") }));
  }

  function goTo(page) {
    state.page = page;
    renderList();
    listTop.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
  }

  function apply(refit) {
    visible = places.map((p, i) => (matches(p) ? i : -1)).filter((i) => i >= 0);
    popup.remove();
    map.getSource(SOURCE)?.setData(geojson());
    if (refit && visible.length) {
      map.fitBounds(boundsOf(visible.map((i) => places[i])), { padding: 48, maxZoom: 15, duration: reduceMotion() ? 0 : 700 });
    }
    state.page = 1;
    renderList();
  }

  let timer;
  document.getElementById("place-search")?.addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.search = e.target.value.trim().toLowerCase();
      apply(true);
    }, 200);
  });

  document.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-category]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      state.category = btn.dataset.category;
      apply(true);
    });
  });

  document.getElementById("city-select")?.addEventListener("change", (e) => {
    state.city = e.target.value;
    apply(true);
  });

  // ── surprise me ────────────────────────────────────────────────
  // Picks among the shown places you rated 4 or 5. With the visitor's location
  // it chooses one of the few closest to them; without, any of them.
  const NEAREST = 5;
  let here = null;
  let hereAt = 0;
  let hereMarker = null;

  const setHere = (pos) => {
    here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    hereAt = Date.now();
    if (!hereMarker) {
      const dot = document.createElement("div");
      dot.className = "map-here";
      dot.title = t("you_are_here");
      hereMarker = new ml.Marker({ element: dot }).setLngLat([here.lng, here.lat]).addTo(map);
      // MapLibre labels every marker "Map marker"; say what this one is
      dot.setAttribute("aria-label", t("you_are_here"));
    } else {
      hereMarker.setLngLat([here.lng, here.lat]);
    }
  };
  geolocate.on("geolocate", (pos) => {
    toast.dataset.show = "false";
    setHere(pos);
  });

  const distance = (a, b) => {
    const R = 6371000;
    const rad = (d) => (d * Math.PI) / 180;
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const formatDistance = (m) =>
    m < 1000
      ? `${Math.round(m / 10) * 10} m`
      : `${(m / 1000).toLocaleString(lang() === "vi" ? "vi-VN" : "en-GB", { maximumFractionDigits: m < 10000 ? 1 : 0 })} km`;

  // the visitor's position, asked for once and reused for ten minutes
  const locate = () =>
    new Promise((resolve) => {
      if (here && Date.now() - hereAt < 600000) return resolve(here);
      if (!("geolocation" in navigator)) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setHere(pos);
          resolve(here);
        },
        (e) => {
          showToast(locateError(e));
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
      );
    });

  const randomButton = document.getElementById("place-random");
  randomButton?.addEventListener("click", async () => {
    if (!visible.length || randomButton.getAttribute("aria-busy") === "true") return;
    const open = visible.filter((i) => !places[i].status);
    let pool = open.filter((i) => places[i].rating >= 4);
    const unrated = pool.length === 0;
    if (unrated) pool = open.length ? open : visible;

    randomButton.setAttribute("aria-busy", "true");
    const label = randomButton.querySelector("span");
    const original = label.textContent;
    label.textContent = t("locating");
    const me = await locate();
    randomButton.setAttribute("aria-busy", "false");
    label.textContent = original;

    let pick;
    let banner = unrated ? t("surprise_unrated") : t("surprise");
    if (me) {
      const nearest = pool
        .map((i) => ({ i, d: distance(me, places[i]) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, NEAREST);
      const choice = nearest[Math.floor(Math.random() * nearest.length)];
      pick = choice.i;
      if (!unrated) banner = t("surprise_near", { distance: formatDistance(choice.d) });
    } else {
      pick = pool[Math.floor(Math.random() * pool.length)];
    }
    focus(pick, banner);
  });

  // ── popup photos: previous / next buttons ────────────────────
  // Popups are created by MapLibre on the fly, so listen once on the map.
  const syncPhotoButtons = (strip) => {
    const media = strip.closest(".map-popup-media");
    const atStart = strip.scrollLeft < 4;
    const atEnd = strip.scrollLeft + strip.clientWidth > strip.scrollWidth - 4;
    media.querySelector(".map-popup-prev")?.toggleAttribute("disabled", atStart);
    media.querySelector(".map-popup-next")?.toggleAttribute("disabled", atEnd);
  };
  el.addEventListener("click", (e) => {
    const button = e.target.closest("[data-photo-step]");
    if (!button) return;
    const strip = button.closest(".map-popup-media").querySelector(".map-popup-photos");
    strip.scrollBy({ left: Number(button.dataset.photoStep) * strip.clientWidth, behavior: reduceMotion() ? "auto" : "smooth" });
  });
  el.addEventListener("scroll", (e) => { if (e.target.classList?.contains("map-popup-photos")) syncPhotoButtons(e.target); }, true);

  // ── cards ↔ pins ──────────────────────────────────────────────
  document.querySelectorAll("[data-place]").forEach((card) => {
    const i = Number(card.dataset.place);
    const hot = (on) => map.getSource(SOURCE) && map.setFeatureState({ source: SOURCE, id: i }, { hot: on });
    card.addEventListener("mouseenter", () => hot(true));
    card.addEventListener("mouseleave", () => hot(false));
    card.addEventListener("click", () => focus(i));
  });

  // the page size follows the layout's column count
  let lastSize = pageSize();
  window.addEventListener("resize", () => {
    if (pageSize() !== lastSize) {
      lastSize = pageSize();
      renderList();
    }
  });

  renderList();
}
