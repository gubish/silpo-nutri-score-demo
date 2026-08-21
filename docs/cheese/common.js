const BADGES = {
  "price-week": {
    src: "assets/badges/badge-price-week.svg",
    alt: "Ціна тижня",
    description:
      "Цінотижики — це товари зі знижками, які ви любите. Вони з'являються щотижня з четверга по середу в супермаркетах «Сільпо», на сайті silpo.ua та у застосунку «Сільпо». Акція діє за умови наявності товару в супермаркеті.",
    dates: "Пропозиція діє з 09.07.2026 по 15.07.2026",
  },
  "made-in-ukraine": {
    src: "assets/badges/badge-made-in-ukraine.svg",
    alt: "Зроблено в Україні",
    description:
      "Бейджем «Зроблено в Україні» позначені товари українських виробників. Купуючи їх, ви підтримуєте вітчизняний бізнес та економіку країни.",
  },
  "online-discount": {
    src: "assets/badges/badge-online-discount.svg",
    alt: "Знижка онлайн",
    description:
      "Знижка діє лише для онлайн замовлень на сайті silpo.ua або в застосунку «Сільпо». Вартість товару в супермаркеті може відрізнятися від онлайн-ціни.",
    dates: "Пропозиція діє з 09.07.2026 по 15.07.2026",
  },
  "group-cheaper": {
    src: "assets/badges/badge-group-cheaper.svg",
    alt: "Гуртом дешевше",
    description:
      "Акція «Гуртом дешевше» діє для онлайн замовлень на сайті silpo.ua або в застосунку «Сільпо». Купуйте у кількості, зазначеній на сторінці, і акційна ціна нараховується на кожен товар автоматично.",
    dates: "Пропозиція діє з 09.07.2026 по 15.07.2026",
  },
};

document.querySelectorAll(".footer-col-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.parentElement.classList.toggle("open", !expanded);
  });
});

// ===== Cart =====
// Empty, the header shows a plain "Кошик" button and the phone's floating
// bubble is not there at all. With something in it, both switch to the same
// filled treatment — count badge plus the running total.
//
// Held in sessionStorage rather than a variable: the state is only interesting
// once you add on the listing and then open a product, and a plain variable
// would not survive that hop.
const CART_KEY = "silpo-cart";

// The conversation outlives the page too: a scenario posts a question on one
// page and is answered after a navigation, so both the thread and whether the
// chat was open are kept for the tab's lifetime.
const CHAT_KEY = "silpo-chat";
const CHAT_OPEN_KEY = "silpo-chat-open";
const CHAT_PENDING_KEY = "silpo-chat-pending";
const NUDGE_KEY = "silpo-chat-nudged";

// Reloading is the demo's reset gesture — it puts the cart and the
// conversation back to empty, while following a link between listing and
// product keeps both. Both are page loads, so they are told apart by the
// navigation type.
if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
  [CART_KEY, CHAT_KEY, CHAT_OPEN_KEY, CHAT_PENDING_KEY, NUDGE_KEY].forEach((key) => sessionStorage.removeItem(key));
}

function readCart() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(CART_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function renderCart() {
  const items = readCart();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const amount = `${total.toFixed(2)} грн`;

  document.body.classList.toggle("cart-filled", count > 0);

  const headerBtn = document.querySelector(".header-cart-btn");
  if (headerBtn) {
    headerBtn.innerHTML = count
      ? `<span class="cart-icon-wrap"><img src="assets/pdp/cart-icon.svg" alt="" /><span class="cart-badge">${count}</span></span><span class="cart-total">${amount}</span>`
      : `<img src="assets/cart-outline.svg" alt="" /><span>Кошик</span>`;
    headerBtn.setAttribute("aria-label", count ? `Кошик, ${count} товарів на ${amount}` : "Кошик");
  }

  const bubbleCount = document.getElementById("bubble-cart-count");
  const bubbleTotal = document.getElementById("bubble-cart-total");
  if (bubbleCount) bubbleCount.textContent = count;
  if (bubbleTotal) bubbleTotal.textContent = amount;
}

// price comes from the caller because PRODUCTS is loaded after this file.
function addToCart(slug, price) {
  const items = readCart();
  const existing = items.find((item) => item.slug === slug);
  if (existing) existing.qty += 1;
  else items.push({ slug, price, qty: 1 });
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  renderCart();
}

renderCart();

// Floating assistant: a corner shortcut that belongs on every page, so it is
// injected here rather than copied into each page's markup.
const aiDock = document.createElement("div");
aiDock.className = "ai-dock";
aiDock.innerHTML = `
  <div class="ai-nudge" hidden>
    <button class="ai-nudge-text" type="button"></button>
    <button class="ai-nudge-close" type="button" aria-label="Не зараз"><img src="assets/close.svg" alt="" /></button>
  </div>
  <button class="ai-fab" type="button" aria-label="Запитати помічника">
    <img src="assets/ai-mascot.png" alt="" />
  </button>`;
document.body.appendChild(aiDock);

const aiFab = aiDock.querySelector(".ai-fab");
const aiNudge = aiDock.querySelector(".ai-nudge");

// The chat only sits beside the page from 1440px up. Below that it covers the
// page, so a scenario that lands on a filtered listing has to hand it over.
const chatSplits = window.matchMedia("(min-width: 1440px)");

// Phones get the chat as a full-screen sheet; on wide screens it is a column
// the page makes room for rather than hides under.
const aiChat = document.createElement("div");
aiChat.className = "ai-chat";
aiChat.hidden = true;
// Ready-made intents, offered both as the chat's openers and as the search
// panel's shortcuts. The ones that map onto a quick filter run a scenario —
// the listing opens filtered and the assistant reports what it found; the rest
// are demo-only prompts with nowhere to go yet.
const AI_SCENARIOS = [
  { label: "Добрати білок", href: "index.html?filter=protein" },
  { label: "Щось легке", href: "index.html?filter=fat" },
  { label: "Повторити останнє замовлення" },
  { label: "Зібрати швидку вечерю" },
  { label: "Знайти продукти під мої потреби", href: "index.html?filter=lactose-free" },
];

// Only the ones that lead somewhere are offered as openers, so an empty chat
// never suggests something it cannot follow through on.
const AI_CHAT_OPENERS = AI_SCENARIOS.filter((scenario) => scenario.href);

aiChat.innerHTML = `
  <div class="ai-chat-head">
    <img class="ai-chat-avatar" src="assets/ai-mascot.png" alt="" />
    <span class="ai-chat-title">Помічник Машрум Геннадійович</span>
    <button class="ai-chat-close" type="button" aria-label="Закрити чат">
      <img src="assets/close.svg" alt="" />
    </button>
  </div>
  <div class="ai-chat-body">
    <div class="ai-chat-thread"></div>
    <div class="ai-chat-openers">
      ${AI_CHAT_OPENERS.map(
        (scenario) => `<button class="ai-prompt-chip" type="button">${scenario.label}</button>`
      ).join("")}
    </div>
  </div>
  <form class="ai-chat-composer">
    <input class="ai-chat-input" type="text" placeholder="Запитайте що завгодно…" autocomplete="off" />
    <button class="ai-chat-send" type="submit" aria-label="Надіслати" disabled>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M4 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </form>`;
document.body.appendChild(aiChat);

// Backing for the tiers where the chat covers the page instead of sitting
// beside it. CSS drops it from view once there is room for the split.
const aiChatScrim = document.createElement("div");
aiChatScrim.className = "ai-chat-scrim";
aiChatScrim.hidden = true;
document.body.appendChild(aiChatScrim);

function setChatOpen(open) {
  aiChat.hidden = !open;
  aiChatScrim.hidden = !open;
  document.body.classList.toggle("ai-chat-open", open);
  sessionStorage.setItem(CHAT_OPEN_KEY, open ? "1" : "");
  // Opening the chat answers the invitation, so it is spent — otherwise it
  // would be waiting again the moment the chat is closed.
  if (open) dismissNudge();
}

aiChatScrim.addEventListener("click", () => setChatOpen(false));

const aiChatBody = aiChat.querySelector(".ai-chat-body");
const aiChatThread = aiChat.querySelector(".ai-chat-thread");
const aiChatOpeners = aiChat.querySelector(".ai-chat-openers");
const aiChatForm = aiChat.querySelector(".ai-chat-composer");
const aiChatInput = aiChat.querySelector(".ai-chat-input");
const aiChatSend = aiChat.querySelector(".ai-chat-send");

// Машрум Геннадійович пробув грибом так довго, що переріс саме грибство:
// говорить трохи загадково, допомагає сумлінно, але не приховує, що його
// відірвали від чогось важливішого. Сухого «увімкнув фільтр» тут не буває.
const CHAT_GREETING =
  "О. Прокинувся. Машрум Геннадійович, до ваших послуг — хоч і не скажу, що радий. Кошик, склад, заміна товару: питайте, поки грибниця не покликала назад.";

function readThread() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(CHAT_KEY));
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {
    // fall through to a fresh thread
  }
  return [{ from: "bot", text: CHAT_GREETING }];
}

function renderThread() {
  const thread = readThread();
  aiChatThread.innerHTML = thread
    .map(
      (message) =>
        `<div class="ai-msg from-${message.from === "user" ? "user" : "bot"}">
          ${message.from === "user" ? "" : `<img class="ai-msg-avatar" src="assets/ai-mascot.png" alt="" />`}
          <div class="ai-bubble"></div>
        </div>`
    )
    .join("");
  // Text goes in afterwards so a message can never be read as markup.
  aiChatThread.querySelectorAll(".ai-bubble").forEach((bubble, index) => {
    bubble.textContent = thread[index].text;
  });
  // The openers are the empty chat's starting point; once the conversation is
  // under way they have served their purpose.
  aiChatOpeners.hidden = thread.some((message) => message.from === "user");
  aiChatBody.scrollTop = aiChatBody.scrollHeight;
}

function pushChatMessage(from, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const thread = readThread();
  thread.push({ from, text: trimmed });
  sessionStorage.setItem(CHAT_KEY, JSON.stringify(thread));
  renderThread();
}

// A scenario spans a page load: the question is posted here, the listing opens
// filtered, and the answer is written there — only that page knows how many
// products the filter actually left. Where the chat sits beside the page it
// stays open to show the exchange; where it covers the page it steps aside, and
// the conversation waits behind the mascot.
function runChatScenario(label, href) {
  pushChatMessage("user", label);
  sessionStorage.setItem(CHAT_PENDING_KEY, label);
  setChatOpen(chatSplits.matches);
  window.location.href = href;
}

function sendChatMessage(text) {
  if (!text.trim()) return;
  pushChatMessage("user", text);
  aiChatInput.value = "";
  aiChatSend.disabled = true;
}

aiChatInput.addEventListener("input", () => {
  aiChatSend.disabled = !aiChatInput.value.trim();
});

aiChatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(aiChatInput.value);
});

// An opener is a question someone did not have to type.
aiChatOpeners.addEventListener("click", (event) => {
  const chip = event.target.closest(".ai-prompt-chip");
  if (!chip) return;
  const scenario = AI_SCENARIOS.find((item) => item.label === chip.textContent);
  if (scenario && scenario.href) runChatScenario(scenario.label, scenario.href);
  else sendChatMessage(chip.textContent);
});

renderThread();
// Reopen where the chat sits beside the page; where it covers the page, coming
// back to the conversation stays the reader's decision.
//
// Restoring is not opening: a scenario navigates with the chat already open, so
// sliding it in again would read as the panel closing and reopening. Motion is
// suppressed for the first two frames — long enough for the restored state to
// paint as the starting point rather than something to animate towards.
if (chatSplits.matches && sessionStorage.getItem(CHAT_OPEN_KEY)) {
  document.documentElement.classList.add("ai-chat-instant");
  setChatOpen(true);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.documentElement.classList.remove("ai-chat-instant"));
  });
}

// Him speaking first. It only earns its place if it stays rare: someone who
// grumbles about being woken cannot also pop up on every page. So it waits out
// a stretch of silence, shows once a session, and never talks over a
// conversation already under way.
const NUDGE_DELAY = 8000;
const NUDGE_LINE = "Бачу, ви кружляєте. Ну гаразд — питайте вже, все одно розбудили.";

function dismissNudge() {
  aiNudge.hidden = true;
  sessionStorage.setItem(NUDGE_KEY, "1");
}

aiNudge.querySelector(".ai-nudge-text").addEventListener("click", () => {
  // He opened with this line, so the thread opens with it too — in place of the
  // greeting, not after it. Both say the same thing, and stacked they read as
  // him greeting twice. Safe to replace the whole thread: the invitation only
  // ever appears while it is still just the greeting.
  sessionStorage.setItem(CHAT_KEY, JSON.stringify([{ from: "bot", text: NUDGE_LINE }]));
  renderThread();
  setChatOpen(true);
});

aiNudge.querySelector(".ai-nudge-close").addEventListener("click", dismissNudge);

if (!sessionStorage.getItem(NUDGE_KEY)) {
  aiNudge.querySelector(".ai-nudge-text").textContent = NUDGE_LINE;
  setTimeout(() => {
    // Nothing to invite if the chat has been opened in the meantime — or is
    // open now, or has already been talked to.
    if (sessionStorage.getItem(NUDGE_KEY) || !aiChat.hidden) return;
    if (readThread().some((message) => message.from === "user")) return;
    aiNudge.hidden = false;
  }, NUDGE_DELAY);
}

aiFab.addEventListener("click", () => setChatOpen(true));
aiChat.querySelector(".ai-chat-close").addEventListener("click", () => setChatOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !aiChat.hidden) setChatOpen(false);
});

// ===== Header search =====
// Focusing the field dims the page and opens a panel: recent queries while
// the field is empty, matching products once something is typed. History is
// in-memory only — it resets on reload, which suits a prototype.
const searchInput = document.getElementById("search-input");
const searchPanel = document.getElementById("search-panel");
const searchClear = document.getElementById("search-clear");
const searchBox = document.getElementById("header-search");

if (searchInput && searchPanel && searchBox) {
  let searchHistory = ["сир безлактозний", "сир", "зошит", "горіхи", "картопля варена"];

  // Queries that stand for a ready-made view rather than a plain text search.
  const SEARCH_SHORTCUTS = {
    "сир безлактозний": "index.html?filter=lactose-free",
  };

  // Phones show fewer past queries so the assistant block below stays above
  // the keyboard.
  const HISTORY_DESKTOP = 4;
  const HISTORY_MOBILE = 3;

  const headerBar = document.querySelector(".listing-header-bar, .pdp-header-bar");
  const headerRow = document.querySelector(".header-row");
  const mobileSearchBtn = document.getElementById("mobile-search-btn");
  const isMobile = window.matchMedia("(max-width: 1023px)");
  // Where the header is tight enough that the field rests as an icon — phones
  // included. Expanding it there spans the row rather than centring, and the
  // pill has to open the search itself, since the hidden input cannot be
  // clicked.
  const searchCollapsed = window.matchMedia("(max-width: 1139px)");
  const overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.hidden = true;
  document.body.appendChild(overlay);

  function escapeHtml(text) {
    return text.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  }

  function historyHtml() {
    if (!searchHistory.length) return `<p class="search-empty">Історія пошуку порожня</p>`;
    const rows = searchHistory
      .slice(0, isMobile.matches ? HISTORY_MOBILE : HISTORY_DESKTOP)
      .map(
        (query, index) => `
        <div class="search-row">
          <img class="search-row-icon" src="assets/history-clock.svg" alt="" />
          <button class="search-row-text" type="button" data-query="${escapeHtml(query)}">${escapeHtml(query)}</button>
          <button class="search-row-remove" type="button" aria-label="Видалити з історії" data-remove="${index}"><img class="search-row-icon" src="assets/close-circle.svg" alt="" /></button>
        </div>`
      )
      .join("");
    return `
      <div class="search-panel-head">
        <span class="search-panel-title">Історія пошуку</span>
        <button class="search-panel-clear" type="button" id="search-history-clear">Очистити список</button>
      </div>
      ${rows}`;
  }

  function suggestionsHtml(query) {
    const needle = query.trim().toLowerCase();
    const matches = PRODUCTS.filter((product) => product.name.toLowerCase().includes(needle)).slice(0, 6);
    if (!matches.length) return `<p class="search-empty">Нічого не знайшли за запитом «${escapeHtml(query.trim())}»</p>`;
    return matches
      .map(
        (product) => `
        <a class="search-row" href="product.html?id=${product.slug}">
          <img class="search-row-icon" src="assets/search-icon.svg" alt="" />
          <span class="search-row-text">${escapeHtml(product.name)}</span>
        </a>`
      )
      .join("");
  }

  function aiHtml() {
    const chips = AI_SCENARIOS.map(
      (scenario) =>
        `<button class="ai-prompt-chip" type="button" data-ai="${escapeHtml(scenario.href || "")}">${escapeHtml(
          scenario.label
        )}</button>`
    ).join("");
    return `
      <div class="ai-prompt">
        <span class="ai-prompt-title">Що вам потрібно сьогодні?</span>
        <div class="ai-prompt-row">
          <img class="ai-prompt-mascot" src="assets/ai-mascot.png" alt="" />
          <div class="ai-prompt-chips">${chips}</div>
        </div>
      </div>`;
  }

  function renderSearchPanel() {
    const query = searchInput.value;
    searchPanel.innerHTML = query.trim() ? suggestionsHtml(query) : historyHtml() + aiHtml();
    searchClear.hidden = !query;
    fitPanelToViewport();
  }

  // Open state: the field lifts out of the header flow and widens until the
  // gap on its right matches the gap on its left, so it reads as centred. It
  // goes absolute rather than just growing, so the (dimmed) header keeps its
  // layout instead of reflowing around a wider field.
  function widenSearchField() {
    if (!headerRow) return;
    // Always measure the collapsed field: re-running this on an already
    // widened one would feed its expanded width back into the maths.
    resetSearchField();

    const styles = getComputedStyle(headerRow);
    const row = headerRow.getBoundingClientRect();
    const box = searchBox.getBoundingClientRect();
    const contentLeft = row.left + parseFloat(styles.paddingLeft);
    const contentRight = row.right - parseFloat(styles.paddingRight);

    let left;
    let width;
    if (searchCollapsed.matches) {
      // Collapsed: no room to play with, so the field just spans the row.
      left = contentLeft - row.left;
      width = contentRight - contentLeft;
    } else {
      const leftGap = box.left - contentLeft;
      const centred = contentRight - contentLeft - leftGap * 2;
      // Equal gaps only work while they still leave the field wider than it
      // already is. When they don't, the gaps are given up and the field runs
      // to the edge of the row instead.
      left = box.left - row.left;
      width = centred > box.width ? centred : contentRight - box.left;
    }

    searchBox.style.top = `${(row.height - box.height) / 2}px`;
    searchBox.style.left = `${left}px`;
    searchBox.style.height = `${box.height}px`;
    searchBox.style.width = `${width}px`;
    searchBox.classList.add("expanded");
  }

  // Phones: the on-screen keyboard shrinks the visual viewport without
  // changing the layout one, so a vh-based cap would put the assistant chips
  // behind the keyboard. Measure what is actually left below the field and
  // cap the panel to that instead.
  function fitPanelToViewport() {
    const viewport = window.visualViewport;
    if (searchPanel.hidden || !isMobile.matches || !viewport) {
      searchPanel.style.removeProperty("--search-panel-max");
      return;
    }
    const top = searchPanel.getBoundingClientRect().top - viewport.offsetTop;
    searchPanel.style.setProperty("--search-panel-max", `${Math.max(180, viewport.height - top - 12)}px`);
  }

  function resetSearchField() {
    searchBox.classList.remove("expanded");
    searchBox.style.top = "";
    searchBox.style.left = "";
    searchBox.style.width = "";
    searchBox.style.height = "";
  }

  function setSearchOpen(open) {
    searchPanel.hidden = !open;
    overlay.hidden = !open;
    searchBox.classList.toggle("open", open);
    if (headerBar) headerBar.classList.toggle("search-open", open);
    if (headerRow) headerRow.classList.toggle("search-focused", open);
    if (open) {
      renderSearchPanel();
      widenSearchField();
      fitPanelToViewport();
    } else {
      resetSearchField();
    }
  }

  function rememberQuery(query) {
    const trimmed = query.trim();
    if (!trimmed) return;
    searchHistory = [trimmed, ...searchHistory.filter((item) => item !== trimmed)].slice(0, 8);
  }

  searchInput.addEventListener("focus", () => setSearchOpen(true));

  // Resting as an icon, the field has no clickable input — the pill opens it.
  searchBox.addEventListener("click", () => {
    if (!searchPanel.hidden) return;
    setSearchOpen(true);
    searchInput.focus();
  });

  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener("click", () => {
      setSearchOpen(true);
      searchInput.focus();
    });
  }
  searchInput.addEventListener("input", renderSearchPanel);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      rememberQuery(searchInput.value);
      searchInput.value = "";
      renderSearchPanel();
    }
    if (event.key === "Escape") {
      setSearchOpen(false);
      searchInput.blur();
    }
  });

  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    renderSearchPanel();
    searchInput.focus();
  });

  searchPanel.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove]");
    if (remove) {
      searchHistory.splice(Number(remove.dataset.remove), 1);
      renderSearchPanel();
      return;
    }
    if (event.target.closest("#search-history-clear")) {
      searchHistory = [];
      renderSearchPanel();
      return;
    }
    const scenario = event.target.closest("[data-ai]");
    if (scenario) {
      // Same scenario as the chat's own openers, entered from the search panel.
      if (scenario.dataset.ai) runChatScenario(scenario.textContent, scenario.dataset.ai);
      return;
    }
    const query = event.target.closest("[data-query]");
    if (query) {
      const shortcut = SEARCH_SHORTCUTS[query.dataset.query];
      if (shortcut) {
        window.location.href = shortcut;
        return;
      }
      searchInput.value = query.dataset.query;
      rememberQuery(searchInput.value);
      renderSearchPanel();
      searchInput.focus();
    }
  });

  // mousedown, not click: opening on focus drops the dimmer under the cursor,
  // so by mouseup the click's target is the dimmer and the field's own click
  // would read as an outside one. mousedown is evaluated before that happens.
  window.addEventListener("resize", () => {
    if (searchPanel.hidden) return;
    resetSearchField();
    widenSearchField();
    fitPanelToViewport();
  });

  isMobile.addEventListener("change", () => {
    if (!searchPanel.hidden) renderSearchPanel();
  });

  // Crossing into or out of the collapsed range changes how wide the open
  // field should be.
  searchCollapsed.addEventListener("change", () => {
    if (searchPanel.hidden) return;
    resetSearchField();
    widenSearchField();
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", fitPanelToViewport);
    window.visualViewport.addEventListener("scroll", fitPanelToViewport);
  }

  document.addEventListener("mousedown", (event) => {
    if (searchPanel.hidden) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || !target.closest(".header-search, #mobile-search-btn")) setSearchOpen(false);
  });
}
