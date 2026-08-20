const NUTRI_SCORE_DESCRIPTIONS = {
  A: "Nutri-Score A — найвища харчова якість продукту",
  D: "Nutri-Score D — нижче середньої харчова якість продукту",
};

function badgesHtml(product) {
  const items = (product.badges || [])
    .map((key) => BADGES[key])
    .filter(Boolean)
    .map((b) => `<img class="product-badge" src="${b.src}" alt="${b.alt}" />`)
    .join("");
  return items ? `<div class="product-badges">${items}</div>` : "";
}

function nutriScoreRowHtml(product) {
  if (!product.nutriScore) return "";
  const grade = product.nutriScore.toLowerCase();
  const tooltip = NUTRI_SCORE_DESCRIPTIONS[product.nutriScore] || `Nutri-Score ${product.nutriScore}`;
  return `
    <div class="product-nutriscore-row">
      <span class="product-nutriscore-label">Nutri-Score</span>
      <span class="has-tooltip" data-tooltip="${tooltip}" tabindex="0"><img class="nutri-score-badge" src="assets/nutri-score/nutri-score-small-${grade}.svg" alt="Nutri-Score ${product.nutriScore}" /></span>
    </div>`;
}

// Quick filters. An active filter narrows the grid down to the products it
// matches, and every remaining card carries a single tag — the value that
// filter is about. With no filter active a card shows just its rating.
const QUICK_FILTERS = {
  protein: {
    matches: (product) => product.nutrition.protein >= 20,
    tag: (product) => `Білок ${decimal(product.nutrition.protein)} г / 100 г`,
  },
  fat: {
    matches: (product) => product.nutrition.fat <= 20,
    tag: (product) => `Жирність ${decimal(product.nutrition.fat)}%`,
  },
  "lactose-free": {
    matches: (product) => (product.tags || []).includes("lactose-free"),
    tag: () => "Без лактози",
  },
};

let activeFilter = null;

// Sorting. "popular" keeps the order products are declared in.
const SORTS = {
  protein: (a, b) => b.nutrition.protein - a.nutrition.protein,
  fat: (a, b) => a.nutrition.fat - b.nutrition.fat,
  popular: null,
  promo: (a, b) => Number(b.discount || 0) - Number(a.discount || 0),
  rating: (a, b) => Number(b.rating) - Number(a.rating),
  az: (a, b) => a.name.localeCompare(b.name, "uk"),
  za: (a, b) => b.name.localeCompare(a.name, "uk"),
  cheap: (a, b) => Number(a.price) - Number(b.price),
  expensive: (a, b) => Number(b.price) - Number(a.price),
};

let activeSort = "popular";

function visibleProducts() {
  const filter = activeFilter ? QUICK_FILTERS[activeFilter] : null;
  const products = filter ? PRODUCTS.filter(filter.matches) : PRODUCTS;
  const compare = SORTS[activeSort];
  return compare ? [...products].sort(compare) : products;
}

function decimal(value) {
  return String(value).replace(".", ",");
}

function ratingHtml(product) {
  return `
            <span class="product-rating">
              <img src="assets/star.svg" alt="" />
              <span>${product.rating}</span>
            </span>`;
}

function counterHtml(product) {
  if (product.counter === "timeslot") {
    return `
      <div class="counter-timeslot">
        <span class="ts-label">з 15:00</span>
        <span class="ts-plus"><img src="assets/plus.svg" alt="Додати" /></span>
      </div>`;
  }
  return `
      <div class="counter-plus"><img src="assets/plus.svg" alt="Додати" /></div>`;
}

function cardHtml(product) {
  const badges = badgesHtml(product);
  const discount = product.oldPrice
    ? `<div class="product-discount">
         <span class="old-price">${product.oldPrice}</span>
         <span class="discount-tag">−${product.discount}%</span>
       </div>`
    : "";

  return `
    <article class="product-card" data-slug="${product.slug}">
      <div class="product-image">
        <img class="photo" src="assets/products/${product.img}.${product.ext || "svg"}" alt="${product.name}" />
        ${badges}
        ${counterHtml(product)}
      </div>
      <div class="product-content">
        <div>
          <div class="product-price">${product.price} ₴</div>
          ${discount}
        </div>
        <p class="product-name">${product.name}</p>
        <span class="product-weight">${product.weight} ${product.unit || "г"}</span>
        ${nutriBlockHtml(product)}
      </div>
    </article>`;
}

function nutriBlockHtml(product) {
  const filter = activeFilter ? QUICK_FILTERS[activeFilter] : null;
  if (!filter) {
    return `
        <div class="product-tags-rating rating-only">${ratingHtml(product)}
        </div>`;
  }
  return `
        <div class="product-nutri-block">
          ${nutriScoreRowHtml(product)}
          <div class="product-tags-rating">
            <div class="listing-tags"><span class="listing-tag">${filter.tag(product)}</span></div>${ratingHtml(product)}
          </div>
        </div>`;
}

const grid = document.getElementById("product-grid");
const loadMoreSection = document.querySelector(".load-more-section");

function renderGrid() {
  grid.innerHTML = `<div class="product-row">${visibleProducts().map(cardHtml).join("")}</div>`;

  // A filtered grid is the whole result set, so "Показати ще" and the pager
  // have nothing to page through.
  if (loadMoreSection) loadMoreSection.hidden = Boolean(activeFilter);
  grid.classList.toggle("filtered", Boolean(activeFilter));
  grid.querySelectorAll(".product-card").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", (event) => {
      if (event.target.closest(".counter-plus, .counter-timeslot")) return;
      window.location.href = `product.html?id=${card.dataset.slug}`;
    });
  });
}

renderGrid();

// One quick filter at a time; clicking the active chip clears it.
document.querySelectorAll(".quick-filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const key = chip.dataset.filter;
    activeFilter = activeFilter === key ? null : key;
    document.querySelectorAll(".quick-filter-chip").forEach((other) => {
      other.classList.toggle("selected", other.dataset.filter === activeFilter);
    });
    syncSortOptions();
    renderGrid();
  });
});

// Category chips collapse to a single row that ends with an "Всі" link;
// clicking it expands them onto as many rows as needed. Desktop only — on
// mobile the row stays horizontally scrollable, so nothing is hidden there.
const chipsRow = document.querySelector(".category-chips");
const chipsToggle = document.getElementById("cat-chips-toggle");

if (chipsRow && chipsToggle) {
  const chips = [...chipsRow.querySelectorAll(".cat-chip")];
  const isDesktop = window.matchMedia("(min-width: 1024px)");
  let expanded = false;

  function layoutChips() {
    chips.forEach((chip) => (chip.style.display = ""));

    if (!isDesktop.matches) {
      chipsToggle.style.display = "none";
      return;
    }
    chipsToggle.style.display = "";
    if (expanded) return;

    const styles = getComputedStyle(chipsRow);
    const gap = parseFloat(styles.columnGap) || 0;
    const available =
      chipsRow.clientWidth -
      parseFloat(styles.paddingLeft) -
      parseFloat(styles.paddingRight) -
      chipsToggle.offsetWidth -
      gap;

    let used = 0;
    let overflowed = false;
    chips.forEach((chip) => {
      if (overflowed) {
        chip.style.display = "none";
        return;
      }
      const next = used ? used + gap + chip.offsetWidth : chip.offsetWidth;
      if (next > available) {
        overflowed = true;
        chip.style.display = "none";
      } else {
        used = next;
      }
    });
  }

  chipsToggle.addEventListener("click", () => {
    expanded = !expanded;
    chipsToggle.textContent = expanded ? "Згорнути" : "Всі";
    layoutChips();
  });

  layoutChips();
  if (document.fonts) document.fonts.ready.then(layoutChips);

  // Re-fit on viewport resize, plus a ResizeObserver for width changes that
  // don't come from the window. Both guard on width so the height change
  // from hiding/showing chips can't retrigger them.
  let lastWidth = chipsRow.clientWidth;
  function refitOnWidthChange() {
    if (chipsRow.clientWidth === lastWidth) return;
    lastWidth = chipsRow.clientWidth;
    layoutChips();
  }
  window.addEventListener("resize", refitOnWidthChange);
  if (window.ResizeObserver) new ResizeObserver(refitOnWidthChange).observe(chipsRow);
}

// Sort dropdown. Options carrying data-sort-for belong to a quick filter and
// are only offered while that filter is on.
const sortBtn = document.getElementById("sort-btn");
const sortMenu = document.getElementById("sort-menu");
const sortLabel = document.getElementById("sort-btn-label");

// Below the desktop breakpoint the toolbar scrolls sideways, and iOS Safari
// pulls a position:fixed descendant into the scrolling ancestor's layer — the
// menu then paints behind the product grid instead of over it. Park it on
// <body> while it is open there; desktop keeps it inside .sort-dropdown, which
// is what its absolute positioning is anchored to.
const sortDropdown = sortBtn && sortBtn.closest(".sort-dropdown");
const sortMenuFloats = window.matchMedia("(max-width: 1023px)");

function placeSortMenu() {
  const host = sortMenuFloats.matches ? document.body : sortDropdown;
  if (host && sortMenu.parentElement !== host) host.appendChild(sortMenu);
}

function setSortMenuOpen(open) {
  if (open) placeSortMenu();
  sortMenu.hidden = !open;
  sortBtn.classList.toggle("open", open);
  sortBtn.setAttribute("aria-expanded", String(open));
  if (!open && sortDropdown && sortMenu.parentElement !== sortDropdown) {
    sortDropdown.appendChild(sortMenu);
  }
}

function selectSort(option) {
  activeSort = option.dataset.sort;
  sortLabel.textContent = option.textContent;
  sortMenu.querySelectorAll(".sort-option").forEach((other) => {
    other.classList.toggle("selected", other === option);
  });
}

// Show/hide the filter-specific options, dropping back to the default sort
// if the one in use just went away with its filter.
function syncSortOptions() {
  if (!sortMenu) return;
  let activeSortGone = false;
  sortMenu.querySelectorAll(".sort-option").forEach((option) => {
    const requiredFilter = option.dataset.sortFor;
    const available = !requiredFilter || requiredFilter === activeFilter;
    option.hidden = !available;
    if (!available && option.dataset.sort === activeSort) activeSortGone = true;
  });
  if (activeSortGone) selectSort(sortMenu.querySelector('[data-sort="popular"]'));
}

if (sortBtn && sortMenu) {
  sortBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setSortMenuOpen(sortMenu.hidden);
  });

  sortMenu.querySelectorAll(".sort-option").forEach((option) => {
    option.addEventListener("click", () => {
      selectSort(option);
      setSortMenuOpen(false);
      renderGrid();
    });
  });

  // .sort-menu is listed separately: while open on mobile it lives on <body>,
  // so it is no longer inside .sort-dropdown.
  document.addEventListener("click", (event) => {
    if (!sortMenu.hidden && !event.target.closest(".sort-dropdown, .sort-menu")) {
      setSortMenuOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setSortMenuOpen(false);
  });

  // Rotating the phone can cross the breakpoint with the menu still open.
  sortMenuFloats.addEventListener("change", () => {
    if (!sortMenu.hidden) placeSortMenu();
  });

  syncSortOptions();
}

// A search-history shortcut can land on this page with a filter already
// chosen (index.html?filter=…). Applied last, once the chips, the sort menu
// and the grid are all wired up.
const initialFilter = new URLSearchParams(window.location.search).get("filter");
if (initialFilter && QUICK_FILTERS[initialFilter]) {
  activeFilter = initialFilter;
  document.querySelectorAll(".quick-filter-chip").forEach((chip) => {
    chip.classList.toggle("selected", chip.dataset.filter === activeFilter);
  });
  syncSortOptions();
  renderGrid();
}
