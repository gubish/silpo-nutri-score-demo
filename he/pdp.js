function getProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return PRODUCTS.find((p) => p.slug === id) || PRODUCTS[0];
}

const NUTRI_SCORE_TITLES = {
  A: "Висока поживна цінність",
  D: "Помірна поживна цінність",
};

const NUTRIENT_TAGS = {
  "sugar-free": { code: "БЦ", label: "Без цукру" },
  "nut-allergen": { code: "АГ", label: "Алерген<br>Горіх" },
  vegan: { code: "В", label: "Веган" },
  "gluten-free": { code: "БГ", label: "Без<br>глютену" },
  "lactose-free": { code: "БЛ", label: "Без<br>лактози" },
  organic: { code: "ОР", label: "Органічний" },
  "high-protein": { code: "БІ", label: "Багато<br>білка" },
};

function nutrientsScoreRowHtml(product) {
  if (!product.nutriScore) return "";
  const grade = product.nutriScore.toLowerCase();
  const iconSrc = `assets/nutri-score/nutri-score-big-${grade}.svg`;
  const iconClass = "pill";
  const title = NUTRI_SCORE_TITLES[product.nutriScore] || `Nutri-Score ${product.nutriScore}`;

  return `
    <img class="pdp-nutrients-score-icon ${iconClass}" src="${iconSrc}" alt="Nutri-Score ${product.nutriScore}" />
    <div class="pdp-nutrients-score-text">
      <p class="pdp-nutrients-score-title">${title}</p>
      <p class="pdp-nutrients-score-desc">Nutri-Score – це візуальне представлення таблиці харчової цінності. <a href="https://silpo.ua/about/nutri-score-vash-svidomyj-vybir" target="_blank" rel="noopener noreferrer" class="pdp-nutrients-score-link">Більше про Nutri-Score</a></p>
    </div>`;
}

function nutrientsTagsHtml(product) {
  return (product.tags || [])
    .map((key) => NUTRIENT_TAGS[key])
    .filter(Boolean)
    .map(
      (tag) => `
      <div class="pdp-nutrients-tag">
        <span class="pdp-nutrients-tag-icon">${tag.code}</span>
        <span class="pdp-nutrients-tag-label">${tag.label}</span>
      </div>`
    )
    .join("");
}

function similarCardHtml(product) {
  const discount = product.oldPrice
    ? `<div class="pdp-similar-discount">
         <span class="pdp-similar-old-price">${product.oldPrice}</span>
         <span class="pdp-similar-discount-tag">-${product.discount}%</span>
       </div>`
    : "";
  const firstBadge = (product.badges || []).map((key) => BADGES[key]).filter(Boolean)[0];
  const badge = firstBadge
    ? `<img class="pdp-similar-badge" src="${firstBadge.src}" alt="${firstBadge.alt}" />`
    : "";

  return `
    <a class="pdp-similar-card" href="product.html?id=${product.slug}" style="text-decoration:none;color:inherit">
      <div class="pdp-similar-image">
        <img class="photo" src="assets/products/${product.img}.${product.ext || "svg"}" alt="${product.name}" />
        ${badge}
        <div class="pdp-similar-counter"><img src="assets/pdp/controls-plus.svg" alt="Додати" /></div>
      </div>
      <div class="pdp-similar-content">
        <div class="pdp-similar-price">${product.price} ₴</div>
        ${discount}
        <p class="pdp-similar-name">${product.name}</p>
        <div class="pdp-similar-meta">
          <span class="pdp-similar-weight">${product.weight} ${product.unit || "г"}</span>
          <span class="pdp-similar-rating">
            <img src="assets/pdp/pdp-star.svg" alt="" />
            <span>${product.rating}</span>
          </span>
        </div>
      </div>
    </a>`;
}

const product = getProductFromUrl();
const photoSrc = `assets/products/${product.img}.${product.ext || "svg"}`;

document.getElementById("page-title").textContent = `${product.name} — Сільпо`;
document.getElementById("crumb-current").textContent = product.name;

document.getElementById("pdp-thumbs").innerHTML = [1, 2, 3]
  .map(
    (i, idx) =>
      `<button class="pdp-thumb${idx === 0 ? " active" : ""}"><img src="${photoSrc}" alt="Фото ${i}" /></button>`
  )
  .join("");

const mainImg = document.getElementById("pdp-main-img");
mainImg.src = photoSrc;
mainImg.alt = product.name;

const productBadges = (product.badges || []).map((key) => BADGES[key]).filter(Boolean);

document.getElementById("pdp-photo-badges").innerHTML = productBadges
  .map((b) => `<img src="${b.src}" alt="${b.alt}" />`)
  .join("");

document.getElementById("pdp-accordion-badges").innerHTML = productBadges
  .map((b) => `<img src="${b.src}" alt="" />`)
  .join("");

document.getElementById("pdp-promo-rows").innerHTML = productBadges
  .map(
    (b) => `
      <div class="pdp-promo-row">
        <img src="${b.src}" alt="" class="pdp-promo-icon" />
        <div class="pdp-promo-text">
          <p>${b.description}</p>
          ${b.dates ? `<p class="pdp-promo-dates">${b.dates}</p>` : ""}
        </div>
      </div>`
  )
  .join("");

document.getElementById("pdp-title").textContent = product.name;
document.getElementById("pdp-rating-text").textContent = product.rating;

document.getElementById("pdp-price").textContent = `${product.price} ₴`;
if (product.oldPrice) {
  document.getElementById("pdp-old-price").textContent = product.oldPrice;
  document.getElementById("pdp-discount-tag").textContent = `-${product.discount} %`;
} else {
  document.getElementById("pdp-discount-row").style.display = "none";
}

document.getElementById("sticky-price").textContent = `${product.price} ₴`;
if (product.oldPrice) {
  document.getElementById("sticky-old-price").textContent = product.oldPrice;
  document.getElementById("sticky-discount-tag").textContent = `-${product.discount} %`;
} else {
  document.getElementById("sticky-discount-row").style.display = "none";
}

document.getElementById("pdp-country").textContent = product.country;
document.getElementById("pdp-brand").textContent = product.brand;
document.getElementById("pdp-units").textContent = product.units;
document.getElementById("pdp-description").textContent = product.description;

if (!productBadges.length) {
  document.getElementById("pdp-promo-accordion").style.display = "none";
}

document.getElementById("pdp-nutrients-energy").textContent = `${product.nutrition.kcal} кКал / ${product.nutrition.kj} кДЖ`;
document.getElementById("pdp-nutrients-protein").textContent = `${product.nutrition.protein} г`;
document.getElementById("pdp-nutrients-fat").textContent = `${product.nutrition.fat} г`;
document.getElementById("pdp-nutrients-carbs").textContent = `${product.nutrition.carbs} г`;
document.getElementById("pdp-nutrients-score-row").innerHTML = nutrientsScoreRowHtml(product);
const nutrientsTagsRow = document.getElementById("pdp-nutrients-tags");
nutrientsTagsRow.innerHTML = nutrientsTagsHtml(product);
nutrientsTagsRow.style.display = (product.tags || []).length ? "" : "none";

const similar = PRODUCTS.filter((p) => p.slug !== product.slug)
  .sort(() => Math.random() - 0.5)
  .slice(0, 6);
document.getElementById("pdp-similar-grid").innerHTML = similar.map(similarCardHtml).join("");

document.querySelectorAll(".pdp-thumb").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    document.querySelector(".pdp-thumb.active")?.classList.remove("active");
    thumb.classList.add("active");
    mainImg.src = thumb.querySelector("img").src;
  });
});

document.querySelectorAll(".pdp-accordion-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const accordion = toggle.closest(".pdp-accordion");
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    accordion.classList.toggle("open", !expanded);
  });
});
