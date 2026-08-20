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

  // The assistant half of the panel: ready-made intents offered instead of a
  // typed query. The ones that map onto a quick filter open the filtered
  // listing; the rest are demo-only prompts with nowhere to go yet.
  const AI_SCENARIOS = [
    { label: "Добрати білок", href: "index.html?filter=protein" },
    { label: "Щось легке", href: "index.html?filter=fat" },
    { label: "Повторити останнє замовлення" },
    { label: "Зібрати швидку вечерю" },
    { label: "Знайти продукти під мої потреби", href: "index.html?filter=lactose-free" },
  ];

  // Phones show fewer past queries so the assistant block below stays above
  // the keyboard.
  const HISTORY_DESKTOP = 4;
  const HISTORY_MOBILE = 3;

  const headerBar = document.querySelector(".listing-header-bar, .pdp-header-bar");
  const headerRow = document.querySelector(".header-row");
  const mobileSearchBtn = document.getElementById("mobile-search-btn");
  const isMobile = window.matchMedia("(max-width: 1023px)");
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
    if (isMobile.matches) {
      // Phones: no room to play with, so the field just spans the row.
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
      if (scenario.dataset.ai) window.location.href = scenario.dataset.ai;
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
