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

// Cart button doubles as a quick switcher between the pill and square
// Nutri-Score demo variants, preserving the current page type and product id.
const cartBtn = document.querySelector(".header-cart-btn");
if (cartBtn) {
  const DEMO_SWAP = {
    "index.html": "index-2.html",
    "index-2.html": "index.html",
    "product.html": "product-2.html",
    "product-2.html": "product.html",
  };
  cartBtn.addEventListener("click", () => {
    const path = window.location.pathname;
    const current = Object.keys(DEMO_SWAP).find((name) => path.endsWith(name)) || "index.html";
    window.location.href = DEMO_SWAP[current] + window.location.search;
  });
}
