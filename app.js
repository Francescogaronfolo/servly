const demoItems = [
  {
    id: "req-1",
    type: "richiesta",
    title: "Pulizie condominiali",
    place: "Magenta",
    category: "Pulizie",
    summary: "Condominio cerca servizio periodico per scale, ingresso e gestione bidoni.",
    description: "Richiesta per pulizia scale, corridoi, ingresso e supporto nella gestione dei contenitori secondo calendario comunale.",
    email: "condominio.demo@email.it",
    phone: "+39 333 000 1122",
    website: "",
    color: "green"
  },
  {
    id: "req-2",
    type: "richiesta",
    title: "Sgombero appartamento",
    place: "Legnano",
    category: "Sgombero",
    summary: "Privato cerca sopralluogo per svuotamento locale e ritiro materiali.",
    description: "Serve contatto per valutare tempi, accesso al piano, volume indicativo e modalita di smaltimento.",
    email: "cliente.demo@email.it",
    phone: "+39 333 000 3344",
    website: "",
    color: "orange"
  },
  {
    id: "sup-1",
    type: "fornitore",
    title: "Verde Nord Servizi",
    place: "Rho",
    category: "Giardinaggio",
    summary: "Fornitore disponibile per manutenzione verde, siepi e piccoli interventi esterni.",
    description: "Opera su condomini e proprieta private. Profilo demo con banner predefinito e contatti simulati.",
    email: "verde.demo@email.it",
    phone: "+39 333 000 5566",
    website: "https://example.com",
    color: "green"
  },
  {
    id: "sup-2",
    type: "fornitore",
    title: "Clean Lab Milano",
    place: "Milano Ovest",
    category: "Pulizie",
    summary: "Azienda demo per pulizie civili, uffici e ambienti aziendali.",
    description: "Scheda fornitore demo: prima dello sblocco sono visibili solo zona, categoria e descrizione generale.",
    email: "cleanlab.demo@email.it",
    phone: "+39 333 000 7788",
    website: "https://example.com",
    color: "dark"
  },
  {
    id: "req-3",
    type: "richiesta",
    title: "Giardinaggio cortile",
    place: "Castano Primo",
    category: "Giardinaggio",
    summary: "Richiesta per potatura leggera e sistemazione area verde condominiale.",
    description: "La richiesta riguarda manutenzione ordinaria, taglio e riordino dell'area verde esterna.",
    email: "studio.demo@email.it",
    phone: "+39 333 000 9911",
    website: "",
    color: "green"
  },
  {
    id: "sup-3",
    type: "fornitore",
    title: "Sgomberi Rapidi Zona Ovest",
    place: "Abbiategrasso",
    category: "Sgombero",
    summary: "Fornitore demo per sgomberi di case, garage e piccole proprieta.",
    description: "Disponibile per richieste con sopralluogo e preventivo indicativo. Dati reali nascosti fino allo sblocco.",
    email: "sgomberi.demo@email.it",
    phone: "+39 333 000 1212",
    website: "https://example.com",
    color: "orange"
  }
];

const storageKey = "servlyDemoState";
const unlockCost = 0.10;

const state = loadState();
let visibleItems = [...demoItems];
let currentItemId = null;

const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll("[data-nav]");
const wallet = document.querySelector("[data-wallet]");
const featured = document.querySelector("[data-featured]");
const market = document.querySelector("[data-market]");
const detail = document.querySelector("[data-detail]");
const searchForm = document.querySelector("[data-search-form]");
const unlockedList = document.querySelector("[data-unlocked-list]");
const profileForm = document.querySelector("[data-profile-form]");
const toast = document.querySelector("[data-toast]");

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return {
      credit: Number.isFinite(saved?.credit) ? saved.credit : 5,
      unlocked: Array.isArray(saved?.unlocked) ? saved.unlocked : [],
      profile: {
        name: "Azienda demo",
        place: "Milano",
        email: "demo@servly.it",
        phone: "+39 333 000 0000",
        vat: "",
        website: "",
        description: "Profilo dimostrativo per testare la piattaforma.",
        ...(saved?.profile || {})
      }
    };
  } catch {
    return {
      credit: 5,
      unlocked: [],
      profile: {
        name: "Azienda demo",
        place: "Milano",
        email: "demo@servly.it",
        phone: "+39 333 000 0000",
        vat: "",
        website: "",
        description: "Profilo dimostrativo per testare la piattaforma."
      }
    };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function money(value) {
  return `${value.toFixed(2).replace(".", ",")} euro`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAll() {
  wallet.textContent = money(state.credit);
  renderFeatured();
  renderMarket();
  renderUnlocked();
  fillProfile();
}

function renderFeatured() {
  const items = visibleItems.slice(0, 4);
  featured.innerHTML = items.map((item) => cardTemplate(item, "featured")).join("");
}

function renderMarket() {
  market.innerHTML = visibleItems.map((item) => cardTemplate(item, "compact")).join("");
}

function cardTemplate(item, size) {
  return `
    <button class="item-card ${size} ${item.color}" type="button" data-open="${item.id}">
      <span class="badge">${item.type}</span>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <div class="meta-row">
          <span>${escapeHtml(item.place)}</span>
          <span>${escapeHtml(item.category)}</span>
        </div>
      </div>
    </button>
  `;
}

function openScreen(id) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === id));
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.nav === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openDetail(id) {
  currentItemId = id;
  const item = demoItems.find((entry) => entry.id === id);
  if (!item) return;
  const isUnlocked = state.unlocked.includes(id);

  detail.innerHTML = `
    <div class="detail-banner">
      <p class="eyebrow">${item.type} · ${escapeHtml(item.place)}</p>
      <h1>${escapeHtml(item.title)}</h1>
    </div>
    <div class="detail-layout">
      <div class="avatar-panel">
        <div class="avatar-symbol">${escapeHtml(item.category.slice(0, 2).toUpperCase())}</div>
        <h2>${escapeHtml(item.category)}</h2>
        <p>${escapeHtml(item.place)}</p>
        <div class="meta-row">
          <span>Indice demo</span>
          <span>${isUnlocked ? "Contatto aperto" : "Dettagli chiusi"}</span>
        </div>
      </div>
      <div class="description-panel">
        <h2>Descrizione</h2>
        <p>${escapeHtml(item.description)}</p>
        ${isUnlocked ? unlockedTemplate(item) : lockedTemplate()}
      </div>
    </div>
  `;
  openScreen("detail-screen");
}

function lockedTemplate() {
  return `
    <div class="locked-panel">
      <h2>Dati protetti</h2>
      <p>Prima dello sblocco vedi solo informazioni generali. Lo sblocco demo scala 0,10 euro dal credito simulato.</p>
      <div class="locked-lines">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <button class="unlock-button" type="button" data-unlock>Sblocca dettagli · 0,10 euro</button>
    </div>
  `;
}

function unlockedTemplate(item) {
  return `
    <div class="unlocked-panel">
      <h2>Dettagli sbloccati</h2>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></p>
      <p><strong>Telefono:</strong> <a href="tel:${escapeHtml(item.phone.replaceAll(" ", ""))}">${escapeHtml(item.phone)}</a></p>
      ${item.website ? `<p><strong>Sito / social:</strong> <a href="${escapeHtml(item.website)}" target="_blank" rel="noopener">${escapeHtml(item.website)}</a></p>` : ""}
    </div>
  `;
}

function unlockCurrent() {
  if (!currentItemId || state.unlocked.includes(currentItemId)) return;
  if (state.credit < unlockCost) {
    showToast("Credito demo insufficiente.");
    return;
  }

  state.credit = Math.round((state.credit - unlockCost) * 100) / 100;
  state.unlocked.push(currentItemId);
  saveState();
  wallet.textContent = money(state.credit);
  showToast("Dettagli sbloccati nella demo.");
  openDetail(currentItemId);
  renderUnlocked();
}

function renderUnlocked() {
  const items = state.unlocked
    .map((id) => demoItems.find((item) => item.id === id))
    .filter(Boolean);

  unlockedList.innerHTML = items.length
    ? items.map((item) => `
      <button class="chat-item" type="button" data-open="${item.id}">
        <span class="chat-avatar">${escapeHtml(item.category.slice(0, 2).toUpperCase())}</span>
        <span>
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.place)} · ${escapeHtml(item.email)}</span>
        </span>
        <small>Da seguire</small>
      </button>
    `).join("")
    : `<p class="empty">Nessun contatto sbloccato nella demo.</p>`;
}

function fillProfile() {
  if (!profileForm) return;
  Object.entries(state.profile).forEach(([key, value]) => {
    const field = profileForm.elements[key];
    if (field) field.value = value;
  });
}

function shuffleItems() {
  visibleItems = [...visibleItems].sort(() => Math.random() - 0.5);
  renderFeatured();
  renderMarket();
}

function runSearch(formData) {
  const query = String(formData.get("query") || "").trim().toLowerCase();
  const place = String(formData.get("place") || "").trim().toLowerCase();

  visibleItems = demoItems.filter((item) => {
    const matchesQuery = !query || [item.title, item.category, item.summary, item.type]
      .some((value) => value.toLowerCase().includes(query));
    const matchesPlace = !place || item.place.toLowerCase().includes(place);
    return matchesQuery && matchesPlace;
  });

  if (!visibleItems.length) {
    visibleItems = [...demoItems];
    showToast("Nessun risultato demo: mostro di nuovo tutto.");
  }

  renderFeatured();
  renderMarket();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open]");
  if (openButton) {
    openDetail(openButton.dataset.open);
    return;
  }

  if (event.target.closest("[data-unlock]")) {
    unlockCurrent();
    return;
  }

  if (event.target.closest("[data-back]")) {
    openScreen("home-screen");
    return;
  }

  const nav = event.target.closest("[data-nav]");
  if (nav) {
    openScreen(nav.dataset.nav);
  }
});

document.querySelector("[data-shuffle]").addEventListener("click", shuffleItems);

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch(new FormData(searchForm));
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.profile = Object.fromEntries(new FormData(profileForm).entries());
  saveState();
  showToast("Profilo demo salvato.");
});

setInterval(() => {
  if (document.querySelector("#home-screen.active")) {
    shuffleItems();
  }
}, 6000);

renderAll();
