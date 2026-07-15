function badgesHtml(product) {
  const items = (product.badges || [])
    .map((key) => BADGES[key])
    .filter(Boolean)
    .map((b) => `<img class="product-badge" src="${b.src}" alt="${b.alt}" />`)
    .join("");
  return items ? `<div class="product-badges">${items}</div>` : "";
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
    <article class="product-card">
      <div class="product-image">
        <img class="photo" src="assets/products/${product.img}.png" alt="${product.name}" />
        ${badges}
        ${counterHtml(product)}
      </div>
      <div class="product-content">
        <div>
          <div class="product-price">${product.price} ₴</div>
          ${discount}
        </div>
        <p class="product-name">${product.name}</p>
        <div class="product-meta">
          <span class="product-weight">${product.weight} г</span>
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
