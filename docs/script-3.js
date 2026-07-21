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

function productTagsHtml(product) {
  const items = (product.tags || [])
    .slice(0, 2)
    .map((key) => TAG_META[key])
    .filter(Boolean)
    .map((tag) => `<span class="listing-tag">${tag.label}</span>`)
    .join("");
  return `<div class="listing-tags">${items}</div>`;
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
        <div class="product-nutri-block">
          ${nutriScoreRowHtml(product)}
          <div class="product-tags-rating">
            ${productTagsHtml(product)}
            <span class="product-rating">
              <img src="assets/star.svg" alt="" />
              <span>${product.rating}</span>
            </span>
          </div>
        </div>
      </div>
    </article>`;
}

const grid = document.getElementById("product-grid");
grid.innerHTML = `<div class="product-row">${PRODUCTS.map(cardHtml).join("")}</div>`;

grid.querySelectorAll(".product-card").forEach((card) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", (event) => {
    if (event.target.closest(".counter-plus, .counter-timeslot")) return;
    window.location.href = `product-3.html?id=${card.dataset.slug}`;
  });
});
