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

function nutriScoreHtml(product) {
  if (!product.nutriScore) return "";
  const grade = product.nutriScore.toLowerCase();
  const tooltip = NUTRI_SCORE_DESCRIPTIONS[product.nutriScore] || `Nutri-Score ${product.nutriScore}`;
  return `<span class="has-tooltip" data-tooltip="${tooltip}" tabindex="0"><img class="nutri-score-badge" src="assets/nutri-score/nutri-score-big-${grade}.svg" alt="Nutri-Score ${product.nutriScore}" /></span>`;
}

function productTagsHtml(product) {
  const items = (product.tags || [])
    .slice(0, 2)
    .map((key) => TAG_META[key])
    .filter(Boolean)
    .map((tag) =>
      tag.icon
        ? `<span class="has-tooltip listing-tag" data-tooltip="${tag.label}" tabindex="0"><span class="listing-tag-icon-wrap"><img class="listing-tag-icon" src="${tag.icon}" alt="${tag.label}" /></span></span>`
        : `<span class="has-tooltip listing-tag" data-tooltip="${tag.label}" tabindex="0"><span class="listing-tag-code">${tag.code}</span></span>`
    )
    .join("");
  return items ? `<div class="listing-tags">${items}</div>` : "";
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
        <div class="product-nutriscore-overlay">${nutriScoreHtml(product)}</div>
        ${counterHtml(product)}
      </div>
      <div class="product-content">
        <div>
          <div class="product-price">${product.price} ₴</div>
          ${discount}
        </div>
        <div class="product-title">
          <p class="product-name">${product.name}</p>
          <span class="product-weight">${product.weight} ${product.unit || "г"}</span>
        </div>
        <div class="product-meta">
          <div class="product-diet-badges">
            ${productTagsHtml(product)}
          </div>
          <span class="product-rating">
            <img src="assets/star.svg" alt="" />
            <span>${product.rating}</span>
          </span>
        </div>
      </div>
    </article>`;
}

const grid = document.getElementById("product-grid");
grid.innerHTML = PRODUCT_ROWS.map(
  (row) => `<div class="product-row">${row.map(cardHtml).join("")}</div>`
).join("");

grid.querySelectorAll(".product-card").forEach((card) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", (event) => {
    if (event.target.closest(".counter-plus, .counter-timeslot")) return;
    window.location.href = `product.html?id=${card.dataset.slug}`;
  });
});
