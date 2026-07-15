function similarBadgeHtml(product) {
  if (product.badge === "only-online") {
    return `<img class="pdp-similar-badge" src="assets/pdp/badge-only-online-small.png" alt="Тільки онлайн" />`;
  }
  if (product.badge === "promo-bubbles") {
    return `<img class="pdp-similar-badge" src="assets/pdp/badge-promo-bubbles-small.svg" alt="Ціна тижня" />`;
  }
  return "";
}

function similarCardHtml(product) {
  const discount = product.oldPrice
    ? `<div class="pdp-similar-discount">
         <span class="pdp-similar-old-price">${product.oldPrice}</span>
         <span class="pdp-similar-discount-tag">-${product.discount}%</span>
       </div>`
    : "";

  return `
    <article class="pdp-similar-card">
      <div class="pdp-similar-image">
        <img class="photo" src="assets/pdp/${product.img}.png" alt="${product.name}" />
        ${similarBadgeHtml(product)}
        <div class="pdp-similar-counter"><img src="assets/pdp/controls-plus.svg" alt="Додати" /></div>
      </div>
      <div class="pdp-similar-content">
        <div class="pdp-similar-price">${product.price} ₴</div>
        ${discount}
        <p class="pdp-similar-name">${product.name}</p>
        <div class="pdp-similar-meta">
          <span class="pdp-similar-weight">${product.weight} мл</span>
          <span class="pdp-similar-rating">
            <img src="assets/pdp/pdp-star.svg" alt="" />
            <span>${product.rating}</span>
          </span>
        </div>
      </div>
    </article>`;
}

document.getElementById("pdp-similar-grid").innerHTML = SIMILAR_PRODUCTS.map(similarCardHtml).join("");

document.querySelectorAll(".pdp-thumb").forEach((thumb, i) => {
  thumb.addEventListener("click", () => {
    document.querySelector(".pdp-thumb.active")?.classList.remove("active");
    thumb.classList.add("active");
    const mainImg = document.querySelector(".pdp-main-photo img");
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
