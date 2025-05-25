const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const themeToggle = document.getElementById('themeToggle');
const cartSidebar = document.getElementById('cartSidebar');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsList = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeModalBtn = document.getElementById('closeModalBtn');

let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || {};

async function fetchProducts() {
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    products = await res.json();
    filteredProducts = products;
    populateCategories();
    renderProducts(filteredProducts);
    updateCartUI();
  } catch (err) {
    productGrid.innerHTML = '<p>Error loading products.</p>';
  }
}

function populateCategories() {
  const categories = ['all', ...new Set(products.map(p => p.category))];
  categoryFilter.innerHTML = categories.map(cat =>
    `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
  ).join('');
}

function renderProducts(items) {
  if (items.length === 0) {
    productGrid.innerHTML = '<p>No products found.</p>';
    return;
  }
  productGrid.innerHTML = items.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.title}" />
      <h3>${product.title}</h3>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button data-id="${product.id}">Add to Cart</button>
    </div>
  `).join('');

  productGrid.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.id)));
  });
}

function addToCart(id) {
  if(cart[id]) {
    cart[id].qty += 1;
  } else {
    const product = products.find(p => p.id === id);
    cart[id] = { ...product, qty: 1 };
  }
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  const items = Object.values(cart);
  cartItemsList.innerHTML = items.map(item => `
    <li>
      <span>${item.title} x ${item.qty}</span>
      <button onclick="removeFromCart(${item.id})">Remove</button>
    </li>
  `).join('');
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = total.toFixed(2);
  openCartBtn.textContent = `🛒 Cart (${items.length})`;
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  updateCartUI();
}

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm));
  renderProducts(filteredProducts);
});

categoryFilter.addEventListener('change', () => {
  const cat = categoryFilter.value;
  filteredProducts = cat === 'all' ? products : products.filter(p => p.category === cat);
  renderProducts(filteredProducts);
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

openCartBtn.addEventListener('click', () => {
  cartSidebar.classList.add('visible');
});

closeCartBtn.addEventListener('click', () => {
  cartSidebar.classList.remove('visible');
});

checkoutBtn.addEventListener('click', () => {
  cartSidebar.classList.remove('visible');
  checkoutModal.classList.add('visible');
});

closeModalBtn.addEventListener('click', () => {
  checkoutModal.classList.remove('visible');
  cart = {};
  saveCart();
  updateCartUI();
});

fetchProducts();
