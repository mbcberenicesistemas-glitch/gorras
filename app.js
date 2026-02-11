(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const cartBtn = $("#cart-icon");
  const cartModal = $("#cart-modal");
  const closeCart = $("#close-cart");
  const overlay = $("#overlay");
  const cartCountEl = $("#cart-count");
  const cartItemsEl = $("#cart-items");
  const cartTotalEl = $("#cart-total");

  const menuToggle = $("#menu-toggle");
  const navLinks = $("#nav-links");

  const filterBtns = $$(".filter-option");
  const productCards = $$(".product-card");
  const addBtns = $$(".add-to-cart");

  const toastEl = $("#toast");
  let toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  function showOverlay() { overlay.hidden = false; }
  function hideOverlay() { overlay.hidden = true; }

  // Menú móvil
  function setMenuOpen(open) {
    navLinks.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    if (open) showOverlay();
    else if (!cartModal.classList.contains("active")) hideOverlay();
  }

  menuToggle.addEventListener("click", () => {
    setMenuOpen(!navLinks.classList.contains("open"));
  });

  navLinks.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a && window.innerWidth <= 992) setMenuOpen(false);
  });

  // Carrito
  const cart = new Map(); // id -> {id,title,price,img,qty}

  function openCart() {
    cartModal.classList.add("active");
    showOverlay();
  }
  function closeCartModal() {
    cartModal.classList.remove("active");
    if (!navLinks.classList.contains("open")) hideOverlay();
  }

  cartBtn.addEventListener("click", openCart);
  closeCart.addEventListener("click", closeCartModal);

  overlay.addEventListener("click", () => {
    setMenuOpen(false);
    closeCartModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
      closeCartModal();
    }
  });

  function updateCartBadge() {
    let count = 0;
    for (const it of cart.values()) count += it.qty;
    cartCountEl.textContent = String(count);
  }

  function updateCartTotal() {
    let total = 0;
    for (const it of cart.values()) total += it.price * it.qty;
    cartTotalEl.textContent = `$${total}`;
  }

  function renderCart() {
    cartItemsEl.innerHTML = "";

    if (cart.size === 0) {
      const empty = document.createElement("div");
      empty.style.padding = "6px 0";
      empty.style.color = "#555";
      empty.textContent = "Tu carrito está vacío.";
      cartItemsEl.appendChild(empty);
      updateCartTotal();
      updateCartBadge();
      return;
    }

    for (const item of cart.values()) {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img class="cart-item-img" src="${item.img}" alt="${item.title}">
        <div class="cart-item-info">
          <h4>${item.title}</h4>
          <div class="cart-item-price">$${item.price}</div>
          <div class="cart-item-actions" data-id="${item.id}">
            <button type="button" class="decrease-qty" aria-label="Disminuir cantidad">-</button>
            <span aria-label="Cantidad">${item.qty}</span>
            <button type="button" class="increase-qty" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(row);
    }

    updateCartTotal();
    updateCartBadge();
  }

  cartItemsEl.addEventListener("click", (e) => {
    const dec = e.target.closest(".decrease-qty");
    const inc = e.target.closest(".increase-qty");
    if (!dec && !inc) return;

    const actions = e.target.closest(".cart-item-actions");
    const id = actions?.getAttribute("data-id");
    if (!id || !cart.has(id)) return;

    const item = cart.get(id);
    if (dec) item.qty = Math.max(1, item.qty - 1);
    if (inc) item.qty += 1;

    cart.set(id, item);
    renderCart();
  });

  function productDataFromButton(btn) {
    const card = btn.closest(".product-card");
    const id = btn.getAttribute("data-id");
    const title = $(".product-title", card)?.textContent?.trim() ?? "Producto";
    const img = $(".product-img", card)?.src ?? "";
    const price = Number($(".product-price", card)?.getAttribute("data-price") || 0);
    return { id, title, img, price };
  }

  addBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const { id, title, img, price } = productDataFromButton(btn);
      if (!id) return;

      const existing = cart.get(id);
      if (existing) existing.qty += 1;
      else cart.set(id, { id, title, img, price, qty: 1 });

      renderCart();
      toast(`${title} añadido al carrito`);
      openCart();
    });
  });

  // Filtros
  function setActiveFilter(activeBtn) {
    filterBtns.forEach((b) => {
      const active = b === activeBtn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
  }

  function applyFilter(filter) {
    productCards.forEach((card) => {
      const cat = card.getAttribute("data-category");
      const show = filter === "all" || cat === filter;
      card.style.display = show ? "" : "none";
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter") || "all";
      setActiveFilter(btn);
      applyFilter(filter);
      toast(filter === "all" ? "Mostrando todas" : `Categoría: ${btn.textContent.trim()}`);
    });
  });

  renderCart();

  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      if (!cartModal.classList.contains("active")) hideOverlay();
    }
  });
})();
