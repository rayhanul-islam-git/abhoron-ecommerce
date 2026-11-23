import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ==========================================================================
   1. Firebase Configuration & RBAC
   ========================================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyBImQiumgeTUbO9rg2q-U00rIe2LCEOfXY",
  authDomain: "uftb-academic-projects.firebaseapp.com",
  projectId: "uftb-academic-projects",
  storageBucket: "uftb-academic-projects.firebasestorage.app",
  messagingSenderId: "599797634726",
  appId: "1:599797634726:web:19e2df77f5ab264fa48667",
  measurementId: "G-LM0QPBFQG3"
};

const ADMIN_EMAILS = ["alansari10157@gmail.com"];
const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered"];
const PROMO_CODES = {
  ABHORON15: { rate: 0.15, label: "15% Heritage Privilege" }
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/* ==========================================================================
   2. Curated Bangladeshi Couture Catalog (12 Signature Pieces in BDT ৳)
   ========================================================================== */
const DEFAULT_PRODUCTS = [
  {
    id: "abh-jm-001",
    sku: "ABH-JM-001",
    title: "Nawabganj Royal Burgundy Jamdani",
    category: "Jamdani Sarees",
    price: 18500,
    stock: 5,
    rating: 4.9,
    featured: true,
    fabric: "100-Count Muslin Cotton & Antique Zari",
    origin: "Sonargaon Pit-Loom Guild, Narayanganj",
    pattern: "jamdani",
    primaryColor: "#881337",
    accentColor: "#F59E0B",
    sizes: ["Free Size (5.5m + Blouse)"],
    colors: [
      { name: "Royal Burgundy", hex: "#881337" },
      { name: "Deep Maroon", hex: "#5C0A24" },
      { name: "Antique Ivory", hex: "#B08968" }
    ],
    description:
      "Hand-loomed over 180 hours with discontinuous weft diamond buti and a full zari-inlaid anchal. Sheer yet structured drape suited for bridal receptions and evening galas."
  },
  {
    id: "abh-jm-002",
    sku: "ABH-JM-002",
    title: "Champagne Ivory Panna Hajar Jamdani",
    category: "Jamdani Sarees",
    price: 22000,
    stock: 4,
    rating: 5.0,
    featured: true,
    fabric: "120-Count Pure Dhakai Cotton & Gold Zari",
    origin: "Noapara Master Looms, Dhaka",
    pattern: "jamdani",
    primaryColor: "#9A6B42",
    accentColor: "#FDE68A",
    sizes: ["Free Size (5.5m + Blouse)"],
    colors: [
      { name: "Champagne Ochre", hex: "#9A6B42" },
      { name: "Warm Sand", hex: "#B48A60" },
      { name: "Emerald Zari", hex: "#14532D" }
    ],
    description:
      "Celebrated Panna Hajar floral-emerald trellis motif woven across luminous champagne muslin with antique gold temple borders."
  },
  {
    id: "abh-jm-003",
    sku: "ABH-JM-003",
    title: "Midnight Indigo & Copper Zari Jamdani",
    category: "Jamdani Sarees",
    price: 14800,
    stock: 9,
    rating: 4.8,
    featured: false,
    fabric: "84-Count Handspun Cotton & Copper Zari",
    origin: "Demra Artisan Collective",
    pattern: "jamdani",
    primaryColor: "#1E293B",
    accentColor: "#D97706",
    sizes: ["Free Size (5.5m + Blouse)"],
    colors: [
      { name: "Midnight Indigo", hex: "#1E293B" },
      { name: "Teal Peacock", hex: "#115E59" }
    ],
    description:
      "Vegetable-dyed midnight indigo ground illuminated by geometric korola-par borders and hand-inlaid copper zari stars."
  },
  {
    id: "abh-sp-004",
    sku: "ABH-SP-004",
    title: "Rajshahi Mulberry Silk Ceremonial Panjabi",
    category: "Silk Panjabi",
    price: 7800,
    stock: 14,
    rating: 4.9,
    featured: true,
    fabric: "100% GI Rajshahi Mulberry Silk",
    origin: "Rajshahi Sericulture Atelier",
    pattern: "silk",
    primaryColor: "#6B122B",
    accentColor: "#F59E0B",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Imperial Wine", hex: "#6B122B" },
      { name: "Obsidian Plum", hex: "#2E1025" },
      { name: "Champagne Gold", hex: "#92400E" }
    ],
    description:
      "Tailored mandarin-collar panjabi cut from pure Rajshahi mulberry silk with hand-embroidered zardozi placket and mother-of-pearl buttons."
  },
  {
    id: "abh-sp-005",
    sku: "ABH-SP-005",
    title: "Tussar Raw Silk Kantha Panjabi",
    category: "Silk Panjabi",
    price: 5400,
    stock: 18,
    rating: 4.7,
    featured: false,
    fabric: "Handloom Tussar Silk & Nakshi Kantha",
    origin: "Bogra & Chapainawabganj Weavers",
    pattern: "silk",
    primaryColor: "#78350F",
    accentColor: "#FDE68A",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Burnished Bronze", hex: "#78350F" },
      { name: "Forest Olive", hex: "#365314" }
    ],
    description:
      "Naturally textured raw tussar silk featuring tonal running-stitch Nakshi Kantha geometry along the collar and cuffs."
  },
  {
    id: "abh-sp-006",
    sku: "ABH-SP-006",
    title: "Emerald Velvet-Trimmed Endi Silk Panjabi",
    category: "Silk Panjabi",
    price: 6900,
    stock: 11,
    rating: 4.8,
    featured: false,
    fabric: "Pure Endi Silk with Zari Piping",
    origin: "Rajshahi Silk Guild",
    pattern: "silk",
    primaryColor: "#064E3B",
    accentColor: "#FBBF24",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Mughal Emerald", hex: "#064E3B" },
      { name: "Royal Burgundy", hex: "#881337" }
    ],
    description:
      "Breathable winter-weight Endi silk panjabi accented with fine antique zari piping and architectural side slits."
  },
  {
    id: "abh-mk-007",
    sku: "ABH-MK-007",
    title: "Dhakai Muslin Zari-Jaal Festive Kurti",
    category: "Muslin Kurtis",
    price: 4600,
    stock: 16,
    rating: 4.9,
    featured: true,
    fabric: "Fine Half-Silk Muslin & Resham",
    origin: "Tangail & Dhaka Studio",
    pattern: "muslin",
    primaryColor: "#9F1239",
    accentColor: "#FDE68A",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Rose Crimson", hex: "#9F1239" },
      { name: "Saffron Gold", hex: "#B45309" }
    ],
    description:
      "Featherlight muslin A-line kurti layered over breathable cotton voile lining, finished with delicate floral jaal embroidery."
  },
  {
    id: "abh-mk-008",
    sku: "ABH-MK-008",
    title: "Natural Indigo Botanical Muslin Tunic",
    category: "Muslin Kurtis",
    price: 3450,
    stock: 22,
    rating: 4.6,
    featured: false,
    fabric: "Organic Muslin Cotton & Botanical Indigo",
    origin: "Rangpur Natural Dye Collective",
    pattern: "muslin",
    primaryColor: "#1E3A5F",
    accentColor: "#E5C185",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Rangpur Indigo", hex: "#1E3A5F" },
      { name: "Terracotta Clay", hex: "#9A3412" }
    ],
    description:
      "Vat-dyed in fermented botanical indigo and hand-blocked with heritage lotus motifs for effortless daytime sophistication."
  },
  {
    id: "abh-hs-009",
    sku: "ABH-hs-009".toUpperCase(),
    title: "Comilla Handspun Khadi Mandarin Shirt",
    category: "Handloom Shirts",
    price: 2850,
    stock: 24,
    rating: 4.7,
    featured: false,
    fabric: "100% Handspun Comilla Khadi Cotton",
    origin: "Comilla Khadi Cooperative",
    pattern: "handloom",
    primaryColor: "#4A2C2A",
    accentColor: "#D97706",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Espresso Cocoa", hex: "#4A2C2A" },
      { name: "Charcoal Loom", hex: "#27272A" },
      { name: "Warm Sand", hex: "#8D6E63" }
    ],
    description:
      "Tactile slub-textured Khadi shirt woven on pit looms in Comilla, cut in a relaxed contemporary silhouette with wooden buttons."
  },
  {
    id: "abh-hs-010",
    sku: "ABH-HS-010",
    title: "Tangail Loom-Stripe Resort Overshirt",
    category: "Handloom Shirts",
    price: 3150,
    stock: 19,
    rating: 4.8,
    featured: false,
    fabric: "Yarn-Dyed Tangail Handloom Cotton",
    origin: "Pathrail Weavers, Tangail",
    pattern: "handloom",
    primaryColor: "#3F1D2B",
    accentColor: "#F59E0B",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Mulberry Stripe", hex: "#3F1D2B" },
      { name: "Slate Indigo", hex: "#334155" }
    ],
    description:
      "Crisp yarn-dyed vertical handloom stripes with reinforced French seams and subtle selvedge detailing on the placket."
  },
  {
    id: "abh-zs-011",
    sku: "ABH-ZS-011",
    title: "Heirloom Kashmiri Zari Paisley Shawl",
    category: "Zari Shawls",
    price: 9200,
    stock: 7,
    rating: 5.0,
    featured: true,
    fabric: "Fine Pashmina-Blend Wool & Antique Zari",
    origin: "Abhoron Winter Atelier",
    pattern: "shawl",
    primaryColor: "#581126",
    accentColor: "#F59E0B",
    sizes: ["Free Size (2.2m × 1.0m)"],
    colors: [
      { name: "Garnet Burgundy", hex: "#581126" },
      { name: "Midnight Velvet", hex: "#1C1917" }
    ],
    description:
      "Generously proportioned winter shawl woven with intricate kalka paisley borders and shimmering antique gold zari threads."
  },
  {
    id: "abh-zs-012",
    sku: "ABH-ZS-012",
    title: "Chittagong Hill Manipuri Zari Stole",
    category: "Zari Shawls",
    price: 4950,
    stock: 13,
    rating: 4.8,
    featured: false,
    fabric: "Backstrap-Loom Cotton Silk & Zari",
    origin: "Sylhet & Bandarban Loom Artisans",
    pattern: "shawl",
    primaryColor: "#7C2D12",
    accentColor: "#FDE68A",
    sizes: ["Free Size (2.0m × 0.85m)"],
    colors: [
      { name: "Saffron Rust", hex: "#7C2D12" },
      { name: "Deep Burgundy", hex: "#881337" }
    ],
    description:
      "Traditional temple-chevron Manipuri motif reimagined in luminous silk-cotton blend with hand-knotted fringe tassels."
  }
];

/* ==========================================================================
   3. Application State
   ========================================================================== */
const state = {
  products: [...DEFAULT_PRODUCTS],
  orders: loadLocal("abhoron_local_orders", []),
  cart: loadLocal("abhoron_cart", []),
  wishlist: loadLocal("abhoron_wishlist", []),
  promoCode: loadLocal("abhoron_promo", ""),
  user: null,
  isAdmin: false,
  filters: {
    search: "",
    category: "all",
    maxPrice: 25000,
    sort: "featured"
  },
  authMode: "login",
  activeQuickView: null
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ==========================================================================
   4. Bespoke Woven Textile SVG Art Generator (Zero Broken Images!)
   ========================================================================== */
function renderTextileArt(product, overridePrimary) {
  const p = overridePrimary || product.primaryColor || "#881337";
  const a = product.accentColor || "#F59E0B";
  const uid = `tex-${(product.id || "x").replace(/[^a-z0-9]/gi, "")}-${p.replace("#", "")}`;
  const pat = product.pattern || "jamdani";

  let motifLayer = "";

  if (pat === "jamdani") {
    motifLayer = `
      <pattern id="${uid}-pat" width="56" height="56" patternUnits="userSpaceOnUse">
        <path d="M28 6 L48 28 L28 50 L8 28 Z" fill="none" stroke="${a}" stroke-opacity="0.45" stroke-width="1.15"/>
        <path d="M28 14 L40 28 L28 42 L16 28 Z" fill="${a}" fill-opacity="0.16" stroke="${a}" stroke-opacity="0.72" stroke-width="0.9"/>
        <circle cx="28" cy="28" r="2.6" fill="#FFFBF5" fill-opacity="0.82"/>
        <circle cx="0" cy="0" r="2" fill="${a}" fill-opacity="0.5"/>
        <circle cx="56" cy="0" r="2" fill="${a}" fill-opacity="0.5"/>
        <circle cx="0" cy="56" r="2" fill="${a}" fill-opacity="0.5"/>
        <circle cx="56" cy="56" r="2" fill="${a}" fill-opacity="0.5"/>
      </pattern>
      <rect width="480" height="360" fill="url(#${uid}-pat)"/>
      <!-- Zari Anchal Temple Border -->
      <rect x="0" y="294" width="480" height="66" fill="#1C1214" fill-opacity="0.34"/>
      <line x1="0" y1="294" x2="480" y2="294" stroke="${a}" stroke-width="2.2" stroke-opacity="0.88"/>
      <line x1="0" y1="302" x2="480" y2="302" stroke="#FFFBF5" stroke-width="0.8" stroke-opacity="0.5"/>
      <path d="M0 326 L16 308 L32 326 L48 308 L64 326 L80 308 L96 326 L112 308 L128 326 L144 308 L160 326 L176 308 L192 326 L208 308 L224 326 L240 308 L256 326 L272 308 L288 326 L304 308 L320 326 L336 308 L352 326 L368 308 L384 326 L400 308 L416 326 L432 308 L448 326 L464 308 L480 326" fill="none" stroke="${a}" stroke-width="1.5" stroke-opacity="0.85"/>
    `;
  } else if (pat === "silk") {
    motifLayer = `
      <pattern id="${uid}-pat" width="44" height="44" patternUnits="userSpaceOnUse">
        <path d="M0 22 Q11 10 22 22 T44 22" fill="none" stroke="${a}" stroke-opacity="0.32" stroke-width="1"/>
        <circle cx="22" cy="22" r="3" fill="${a}" fill-opacity="0.28"/>
        <path d="M22 14 L25 22 L22 30 L19 22 Z" fill="${a}" fill-opacity="0.45"/>
      </pattern>
      <rect width="480" height="360" fill="url(#${uid}-pat)"/>
      <!-- Ceremonial Placket & Zardozi Collar -->
      <path d="M214 0 L266 0 L266 196 L240 222 L214 196 Z" fill="#1C1214" fill-opacity="0.34" stroke="${a}" stroke-width="1.6"/>
      <path d="M224 14 L256 14 L256 188 L240 205 L224 188 Z" fill="none" stroke="#FFFBF5" stroke-opacity="0.55" stroke-width="0.9" stroke-dasharray="3 3"/>
      <circle cx="240" cy="48" r="4.5" fill="${a}" stroke="#FFFBF5" stroke-width="1.1"/>
      <circle cx="240" cy="86" r="4.5" fill="${a}" stroke="#FFFBF5" stroke-width="1.1"/>
      <circle cx="240" cy="124" r="4.5" fill="${a}" stroke="#FFFBF5" stroke-width="1.1"/>
      <circle cx="240" cy="162" r="4.5" fill="${a}" stroke="#FFFBF5" stroke-width="1.1"/>
    `;
  } else if (pat === "muslin") {
    motifLayer = `
      <pattern id="${uid}-pat" width="64" height="64" patternUnits="userSpaceOnUse">
        <circle cx="32" cy="32" r="14" fill="none" stroke="${a}" stroke-opacity="0.35" stroke-width="1"/>
        <path d="M32 18 C38 26 38 38 32 46 C26 38 26 26 32 18 Z" fill="${a}" fill-opacity="0.22"/>
        <path d="M18 32 C26 26 38 26 46 32 C38 38 26 38 18 32 Z" fill="${a}" fill-opacity="0.22"/>
        <circle cx="32" cy="32" r="3" fill="#FFFBF5" fill-opacity="0.8"/>
      </pattern>
      <rect width="480" height="360" fill="url(#${uid}-pat)"/>
      <rect x="26" y="26" width="428" height="308" rx="14" fill="none" stroke="${a}" stroke-opacity="0.45" stroke-width="1.2" stroke-dasharray="6 4"/>
    `;
  } else if (pat === "handloom") {
    motifLayer = `
      <pattern id="${uid}-pat" width="32" height="32" patternUnits="userSpaceOnUse">
        <line x1="6" y1="0" x2="6" y2="32" stroke="${a}" stroke-opacity="0.34" stroke-width="1.4"/>
        <line x1="12" y1="0" x2="12" y2="32" stroke="#FFFBF5" stroke-opacity="0.22" stroke-width="0.7"/>
        <line x1="0" y1="16" x2="32" y2="16" stroke="#FFFBF5" stroke-opacity="0.14" stroke-width="0.7"/>
        <rect x="20" y="12" width="4" height="4" transform="rotate(45 22 14)" fill="${a}" fill-opacity="0.5"/>
      </pattern>
      <rect width="480" height="360" fill="url(#${uid}-pat)"/>
      <rect x="218" y="0" width="44" height="360" fill="#1C1214" fill-opacity="0.2"/>
      <line x1="218" y1="0" x2="218" y2="360" stroke="${a}" stroke-opacity="0.65" stroke-width="1.2"/>
      <line x1="262" y1="0" x2="262" y2="360" stroke="${a}" stroke-opacity="0.65" stroke-width="1.2"/>
    `;
  } else {
    // shawl paisley & zari border
    motifLayer = `
      <pattern id="${uid}-pat" width="72" height="72" patternUnits="userSpaceOnUse">
        <path d="M36 12 C52 12 56 34 38 52 C28 60 18 52 22 38 C25 28 36 26 36 12 Z" fill="${a}" fill-opacity="0.2" stroke="${a}" stroke-opacity="0.65" stroke-width="1.15"/>
        <circle cx="34" cy="36" r="4" fill="#FFFBF5" fill-opacity="0.65"/>
      </pattern>
      <rect width="480" height="360" fill="url(#${uid}-pat)"/>
      <rect x="18" y="18" width="444" height="324" fill="none" stroke="${a}" stroke-width="2.4" stroke-opacity="0.78"/>
      <rect x="28" y="28" width="424" height="304" fill="none" stroke="#FFFBF5" stroke-width="0.9" stroke-opacity="0.45"/>
    `;
  }

  return `
    <svg viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(product.title)} woven textile preview">
      <defs>
        <linearGradient id="${uid}-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p}"/>
          <stop offset="55%" stop-color="${p}" stop-opacity="0.92"/>
          <stop offset="100%" stop-color="#1C1214"/>
        </linearGradient>
        <radialGradient id="${uid}-sheen" cx="25%" cy="18%" r="78%">
          <stop offset="0%" stop-color="#FFFBF5" stop-opacity="0.28"/>
          <stop offset="45%" stop-color="${a}" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.26"/>
        </radialGradient>
      </defs>
      <rect width="480" height="360" fill="url(#${uid}-base)"/>
      ${motifLayer}
      <rect width="480" height="360" fill="url(#${uid}-sheen)"/>
      <!-- Woven Atelier Seal -->
      <g transform="translate(22, 22)">
        <rect width="128" height="28" rx="14" fill="#1C1214" fill-opacity="0.58" stroke="${a}" stroke-opacity="0.55"/>
        <text x="64" y="18" text-anchor="middle" fill="#FFFBF5" font-family="Outfit, sans-serif" font-size="10.5" letter-spacing="1.8" font-weight="500">ABHORON LOOM</text>
      </g>
    </svg>
  `;
}

/* ==========================================================================
   5. Utilities
   ========================================================================== */
function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-IN")}`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore storage quota errors
  }
}

function showToast(message) {
  const stack = document.getElementById("toastStack");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    el.style.transition = "all 0.25s ease";
    setTimeout(() => el.remove(), 260);
  }, 3000);
}

/* ==========================================================================
   6. 3D Perspective Hover-Tilt Engine
   ========================================================================== */
function bind3DTilt(container = document) {
  if (prefersReducedMotion) return;
  const targets = container.querySelectorAll("[data-tilt]");
  targets.forEach((card) => {
    if (card.dataset.tiltBound === "1") return;
    card.dataset.tiltBound = "1";

    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 11;
      const rotateX = (0.5 - py) * 9;
      card.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      card.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ==========================================================================
   7. Firestore Live Subscriptions & Data Sync
   ========================================================================== */
function initFirestoreListeners() {
  // Live products subscription
  onSnapshot(
    collection(db, "abhoron_products"),
    (snap) => {
      if (!snap.empty) {
        const docs = [];
        snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        state.products = docs;
      } else {
        state.products = [...DEFAULT_PRODUCTS];
      }
      renderCatalog();
      renderHeroArtwork();
      if (state.isAdmin) renderAdminPanel();
    },
    () => {
      // Fallback gracefully to curated catalog if offline or rules restrict
      state.products = [...DEFAULT_PRODUCTS];
      renderCatalog();
      renderHeroArtwork();
    }
  );

  // Live orders subscription
  onSnapshot(
    collection(db, "abhoron_orders"),
    (snap) => {
      const remoteOrders = [];
      snap.forEach((d) => remoteOrders.push({ id: d.id, ...d.data() }));
      mergeOrders(remoteOrders);
      if (state.isAdmin) renderAdminPanel();
      if (!document.getElementById("ordersModal").classList.contains("hidden")) {
        renderOrdersModal();
      }
    },
    () => {
      // Keep local orders if Firestore rules restrict read
    }
  );
}

function mergeOrders(remoteOrders) {
  const byId = new Map();
  loadLocal("abhoron_local_orders", []).forEach((o) => byId.set(o.orderId, o));
  remoteOrders.forEach((o) => byId.set(o.orderId || o.id, o));
  state.orders = Array.from(byId.values()).sort(
    (a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0)
  );
}

async function syncUserProfileToFirestore(user) {
  if (!user) return;
  try {
    await setDoc(
      doc(db, "abhoron_users", user.uid),
      {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "Abhoron Client",
        role: ADMIN_EMAILS.includes((user.email || "").toLowerCase()) ? "admin" : "customer",
        lastSeenAt: serverTimestamp()
      },
      { merge: true }
    );
  } catch {
    // Non-blocking profile sync
  }
}

/* ==========================================================================
   8. Catalog Rendering & Filtering
   ========================================================================== */
function getFilteredProducts() {
  const { search, category, maxPrice, sort } = state.filters;
  const q = search.trim().toLowerCase();

  let list = state.products.filter((p) => {
    if (category === "__wishlist") {
      if (!state.wishlist.includes(p.id)) return false;
    } else if (category !== "all" && p.category !== category) {
      return false;
    }
    if (Number(p.price) > Number(maxPrice)) return false;
    if (q) {
      const hay = `${p.title} ${p.category} ${p.fabric} ${p.sku} ${p.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "rating-desc") list.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
  else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return list;
}

function renderHeroArtwork() {
  const heroSlot = document.getElementById("heroArtwork");
  const flagship = state.products[0] || DEFAULT_PRODUCTS[0];
  heroSlot.innerHTML = renderTextileArt(flagship);
}

function renderCatalog() {
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyCatalogState");
  const summary = document.getElementById("catalogSummary");
  const list = getFilteredProducts();

  summary.textContent = `Showing ${list.length} of ${state.products.length} curated couture editions in BDT (৳)`;
  document.getElementById("wishlistCount").textContent = state.wishlist.length;

  if (!list.length) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  grid.innerHTML = list
    .map((p) => {
      const saved = state.wishlist.includes(p.id);
      const outOfStock = Number(p.stock) <= 0;
      const swatches = (p.colors || [{ name: "Atelier Dye", hex: p.primaryColor }])
        .map(
          (c) =>
            `<span class="swatch-dot" style="background:${c.hex}" title="${escapeHtml(c.name)}"></span>`
        )
        .join("");

      return `
        <article class="product-card" data-tilt data-product-id="${escapeHtml(p.id)}">
          <div class="tilt-glare" aria-hidden="true"></div>
          <div class="product-visual" data-action="quickview" data-id="${escapeHtml(p.id)}">
            ${renderTextileArt(p)}
            <div class="card-badges">
              ${p.featured ? `<span class="badge-featured">Atelier Featured</span>` : ""}
              ${p.stock > 0 && p.stock <= 6 ? `<span class="badge-stock-low">Only ${p.stock} left</span>` : ""}
              ${outOfStock ? `<span class="badge-stock-low">Sold Out</span>` : ""}
            </div>
            <button type="button" class="wishlist-btn ${saved ? "is-saved" : ""}" data-action="wishlist" data-id="${escapeHtml(p.id)}" aria-label="${saved ? "Remove from wishlist" : "Save to wishlist"}">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="${saved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8">
                <path d="M12 20.5s-7-4.5-9.2-8.4C1.2 9.1 3.1 5.5 6.8 5.5c2 0 3.6 1 5.2 2.8 1.6-1.8 3.2-2.8 5.2-2.8 3.7 0 5.6 3.6 4 6.6-2.2 3.9-9.2 8.4-9.2 8.4z"/>
              </svg>
            </button>
          </div>

          <div class="product-body">
            <div class="product-meta-row">
              <span class="product-cat">${escapeHtml(p.category)}</span>
              <span class="product-rating">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2l3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.6 5.9 20.8l1.2-6.8L2.2 9.2 9 8.2z"/></svg>
                ${Number(p.rating || 4.8).toFixed(1)}
              </span>
            </div>

            <h3 class="product-title">${escapeHtml(p.title)}</h3>
            <p class="product-fabric">${escapeHtml(p.fabric)}</p>

            <div class="swatch-row">
              ${swatches}
              <span class="sku-inline">${escapeHtml(p.sku)}</span>
            </div>

            <div class="product-footer">
              <span class="product-price">${formatBDT(p.price)}</span>
              <div class="product-card-actions">
                <button type="button" class="btn-qv" data-action="quickview" data-id="${escapeHtml(p.id)}">Quick View</button>
                <button type="button" class="btn-add-quick" data-action="add-cart" data-id="${escapeHtml(p.id)}" ${outOfStock ? "disabled" : ""}>
                  ${outOfStock ? "Sold Out" : "Add to Bag"}
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  bind3DTilt(grid);
}

/* ==========================================================================
   9. Quick-View Modal (Size & Color Swatch Live Preview)
   ========================================================================== */
function openQuickView(productId) {
  const product = state.products.find((p) => p.id === productId);
  if (!product) return;

  const sizes = product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];
  const colors = product.colors?.length
    ? product.colors
    : [{ name: "Signature Dye", hex: product.primaryColor || "#881337" }];

  state.activeQuickView = {
    product,
    selectedSize: sizes[0],
    selectedColor: colors[0]
  };

  const body = document.getElementById("quickViewBody");
  body.innerHTML = `
    <div class="qv-preview" id="qvArtPreview">
      ${renderTextileArt(product, colors[0].hex)}
    </div>
    <div class="qv-info">
      <span class="sku-tag">${escapeHtml(product.sku)} · ${escapeHtml(product.category)}</span>
      <h2 id="qvTitle">${escapeHtml(product.title)}</h2>
      <p class="qv-price">${formatBDT(product.price)}</p>
      <p class="qv-desc">${escapeHtml(product.description)}</p>

      <div class="qv-selector-group">
        <label>Select Size</label>
        <div class="size-pills" id="qvSizePills">
          ${sizes
            .map(
              (s, i) =>
                `<button type="button" class="size-pill ${i === 0 ? "active" : ""}" data-qv-size="${escapeHtml(s)}">${escapeHtml(s)}</button>`
            )
            .join("")}
        </div>
      </div>

      <div class="qv-selector-group">
        <label>Select Dye &amp; Weave Shade</label>
        <div class="color-swatches" id="qvColorSwatches">
          ${colors
            .map(
              (c, i) => `
                <button type="button" class="color-option ${i === 0 ? "active" : ""}" data-qv-color="${escapeHtml(c.name)}" data-qv-hex="${escapeHtml(c.hex)}">
                  <span class="color-circle" style="background:${c.hex}"></span>
                  <span>${escapeHtml(c.name)}</span>
                </button>`
            )
            .join("")}
        </div>
      </div>

      <div class="qv-care">
        <strong>Fabric &amp; Provenance:</strong> ${escapeHtml(product.fabric)} · ${escapeHtml(product.origin || "Abhoron Dhaka Atelier")}. Dry clean recommended to preserve antique zari luster.
      </div>

      <button type="button" class="btn-burgundy btn-full btn-lg" id="qvAddToBagBtn" ${product.stock <= 0 ? "disabled" : ""}>
        ${product.stock <= 0 ? "Currently Sold Out" : `Add to Couture Bag · ${formatBDT(product.price)}`}
      </button>
    </div>
  `;

  body.querySelectorAll("[data-qv-size]").forEach((btn) => {
    btn.addEventListener("click", () => {
      body.querySelectorAll("[data-qv-size]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeQuickView.selectedSize = btn.dataset.qvSize;
    });
  });

  body.querySelectorAll("[data-qv-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      body.querySelectorAll("[data-qv-color]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.activeQuickView.selectedColor = {
        name: btn.dataset.qvColor,
        hex: btn.dataset.qvHex
      };
      document.getElementById("qvArtPreview").innerHTML = renderTextileArt(
        product,
        btn.dataset.qvHex
      );
    });
  });

  document.getElementById("qvAddToBagBtn").addEventListener("click", () => {
    addToCart(
      product.id,
      state.activeQuickView.selectedSize,
      state.activeQuickView.selectedColor
    );
    closeModal("quickViewModal");
    openCartDrawer();
  });

  openModal("quickViewModal");
}

/* ==========================================================================
   10. Shopping Bag, Promo Code (ABHORON15) & Totals
   ========================================================================== */
function addToCart(productId, size, colorObj) {
  const product = state.products.find((p) => p.id === productId);
  if (!product || product.stock <= 0) {
    showToast("This piece is currently sold out.");
    return;
  }

  const chosenSize = size || product.sizes?.[0] || "Standard";
  const chosenColor = colorObj || product.colors?.[0] || { name: "Signature", hex: product.primaryColor };
  const key = `${product.id}__${chosenSize}__${chosenColor.name}`;

  const existing = state.cart.find((item) => item.key === key);
  if (existing) {
    if (existing.qty >= product.stock) {
      showToast(`Only ${product.stock} available in atelier stock.`);
      return;
    }
    existing.qty += 1;
  } else {
    state.cart.push({
      key,
      productId: product.id,
      sku: product.sku,
      title: product.title,
      price: Number(product.price),
      size: chosenSize,
      colorName: chosenColor.name,
      colorHex: chosenColor.hex,
      pattern: product.pattern,
      accentColor: product.accentColor,
      qty: 1
    });
  }

  saveLocal("abhoron_cart", state.cart);
  renderCart();
  showToast(`Added "${product.title}" to your bag.`);
}

function updateCartQty(key, delta) {
  const item = state.cart.find((i) => i.key === key);
  if (!item) return;
  const prod = state.products.find((p) => p.id === item.productId);
  const nextQty = item.qty + delta;

  if (nextQty <= 0) {
    state.cart = state.cart.filter((i) => i.key !== key);
  } else if (prod && nextQty > prod.stock) {
    showToast(`Maximum available stock is ${prod.stock}.`);
    return;
  } else {
    item.qty = nextQty;
  }

  saveLocal("abhoron_cart", state.cart);
  renderCart();
}

function computeTotals(city = "Dhaka") {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const promo = PROMO_CODES[state.promoCode];
  const discount = promo ? Math.round(subtotal * promo.rate) : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping =
    subtotal === 0 ? 0 : afterDiscount >= 10000 ? 0 : city === "Dhaka" ? 150 : 220;
  const grandTotal = afterDiscount + shipping;
  return { subtotal, discount, shipping, grandTotal };
}

function renderCart() {
  const totalCount = state.cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById("cartCount").textContent = totalCount;
  document.getElementById("cartItemSummary").textContent = `${totalCount} ${totalCount === 1 ? "piece" : "pieces"} selected`;

  const listEl = document.getElementById("cartItemsList");
  const checkoutBtn = document.getElementById("proceedCheckoutBtn");

  if (!state.cart.length) {
    listEl.innerHTML = `
      <div class="cart-empty">
        <h3>Your couture bag is empty</h3>
        <p>Select a Jamdani saree, Rajshahi silk panjabi, or antique zari shawl to begin.</p>
      </div>
    `;
    checkoutBtn.disabled = true;
  } else {
    checkoutBtn.disabled = false;
    listEl.innerHTML = state.cart
      .map(
        (item) => `
        <div class="cart-item">
          <div class="cart-thumb">
            ${renderTextileArt({ id: item.productId, title: item.title, pattern: item.pattern, accentColor: item.accentColor }, item.colorHex)}
          </div>
          <div class="cart-item-info">
            <h4>${escapeHtml(item.title)}</h4>
            <p class="cart-item-variant">${escapeHtml(item.size)} · ${escapeHtml(item.colorName)}</p>
            <div class="cart-item-controls">
              <div class="qty-stepper">
                <button type="button" data-cart-dec="${escapeHtml(item.key)}" aria-label="Decrease quantity">−</button>
                <span>${item.qty}</span>
                <button type="button" data-cart-inc="${escapeHtml(item.key)}" aria-label="Increase quantity">+</button>
              </div>
              <span class="cart-line-price">${formatBDT(item.price * item.qty)}</span>
              <button type="button" class="cart-remove-btn" data-cart-rem="${escapeHtml(item.key)}">Remove</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }

  const { subtotal, discount, shipping, grandTotal } = computeTotals();
  document.getElementById("cartSubtotal").textContent = formatBDT(subtotal);
  document.getElementById("cartShipping").textContent =
    shipping === 0 && subtotal > 0 ? "Complimentary" : formatBDT(shipping);
  document.getElementById("cartGrandTotal").textContent = formatBDT(grandTotal);

  const discRow = document.getElementById("cartDiscountRow");
  if (discount > 0) {
    discRow.classList.remove("hidden");
    document.getElementById("appliedPromoLabel").textContent = state.promoCode;
    document.getElementById("cartDiscount").textContent = `−${formatBDT(discount)}`;
  } else {
    discRow.classList.add("hidden");
  }
}

function openCartDrawer() {
  document.getElementById("cartBackdrop").classList.remove("hidden");
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  document.getElementById("cartBackdrop").classList.add("hidden");
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

/* ==========================================================================
   11. Checkout & Firestore Order Persistence
   ========================================================================== */
function openCheckoutModal() {
  if (!state.cart.length) return;
  closeCartDrawer();

  document.getElementById("checkoutFormView").classList.remove("hidden");
  document.getElementById("checkoutSuccessView").classList.add("hidden");

  if (state.user) {
    document.getElementById("coName").value = state.user.displayName || "";
    document.getElementById("coEmail").value = state.user.email || "";
  }

  renderCheckoutSummary();
  openModal("checkoutModal");
}

function renderCheckoutSummary() {
  const city = document.getElementById("coCity").value || "Dhaka";
  const { subtotal, discount, shipping, grandTotal } = computeTotals(city);

  document.getElementById("checkoutItemsMini").innerHTML = state.cart
    .map(
      (i) => `
      <div class="checkout-mini-item">
        <span>${escapeHtml(i.title)} × ${i.qty} <br><small>${escapeHtml(i.size)} · ${escapeHtml(i.colorName)}</small></span>
        <strong>${formatBDT(i.price * i.qty)}</strong>
      </div>
    `
    )
    .join("");

  document.getElementById("checkoutTotalsMini").innerHTML = `
    <div class="total-row"><span>Subtotal</span><span>${formatBDT(subtotal)}</span></div>
    ${discount > 0 ? `<div class="total-row discount-row"><span>Promo (${state.promoCode})</span><span>−${formatBDT(discount)}</span></div>` : ""}
    <div class="total-row"><span>Courier (${escapeHtml(city)})</span><span>${shipping === 0 ? "Complimentary" : formatBDT(shipping)}</span></div>
    <div class="total-row grand-total"><span>Total Payable</span><span>${formatBDT(grandTotal)}</span></div>
  `;
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  if (!state.cart.length) return;

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.textContent = "Reserving Order...";

  const customerName = document.getElementById("coName").value.trim();
  const phone = document.getElementById("coPhone").value.trim();
  const email = document.getElementById("coEmail").value.trim();
  const city = document.getElementById("coCity").value;
  const address = document.getElementById("coAddress").value.trim();
  const paymentMethod =
    document.querySelector('input[name="paymentMethod"]:checked')?.value || "Cash on Delivery";

  const totals = computeTotals(city);
  const orderId = `ABH-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowMs = Date.now();

  const orderRecord = {
    orderId,
    customerName,
    phone,
    email,
    city,
    address,
    paymentMethod,
    promoCode: state.promoCode || null,
    items: state.cart.map((i) => ({
      productId: i.productId,
      sku: i.sku,
      title: i.title,
      size: i.size,
      colorName: i.colorName,
      price: i.price,
      qty: i.qty
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    total: totals.grandTotal,
    status: "Pending",
    userId: state.user?.uid || "guest",
    createdAtMs: nowMs,
    createdAtISO: new Date(nowMs).toISOString()
  };

  // Persist to Firestore (non-blocking local mirror ensures instant reliability)
  try {
    await setDoc(doc(db, "abhoron_orders", orderId), {
      ...orderRecord,
      createdAt: serverTimestamp()
    });
  } catch {
    // Saved locally even if Firestore rules reject unauthenticated writes
  }

  // Update local stock display
  state.cart.forEach((item) => {
    const prod = state.products.find((p) => p.id === item.productId);
    if (prod) prod.stock = Math.max(0, Number(prod.stock) - item.qty);
  });

  const localOrders = loadLocal("abhoron_local_orders", []);
  localOrders.unshift(orderRecord);
  saveLocal("abhoron_local_orders", localOrders);
  mergeOrders(state.orders);

  // Clear cart
  state.cart = [];
  saveLocal("abhoron_cart", []);
  renderCart();
  renderCatalog();

  // Show receipt
  document.getElementById("checkoutFormView").classList.add("hidden");
  document.getElementById("checkoutSuccessView").classList.remove("hidden");
  document.getElementById("receiptOrderId").textContent = orderId;
  document.getElementById("receiptDetails").innerHTML = `
    <p><strong>Client:</strong> ${escapeHtml(customerName)} (${escapeHtml(phone)})</p>
    <p><strong>Destination:</strong> ${escapeHtml(address)}, ${escapeHtml(city)}</p>
    <p><strong>Payment:</strong> ${escapeHtml(paymentMethod)}</p>
    <p><strong>Total Amount:</strong> ${formatBDT(totals.grandTotal)}</p>
  `;

  btn.disabled = false;
  btn.textContent = "Confirm & Place Order";
  showToast(`Order ${orderId} confirmed!`);
}

/* ==========================================================================
   12. Order Tracker Modal
   ========================================================================== */
function renderOrderCard(order) {
  const stepIdx = Math.max(0, ORDER_STATUSES.indexOf(order.status || "Pending"));
  const dateLabel = order.createdAtISO
    ? new Date(order.createdAtISO).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "Recent";

  return `
    <div class="order-card">
      <div class="order-card-head">
        <div>
          <strong class="mono-id" style="font-size:1.05rem">${escapeHtml(order.orderId)}</strong>
          <span class="muted-note"> · ${dateLabel} · ${escapeHtml(order.paymentMethod || "COD")}</span>
        </div>
        <span class="status-pill status-${escapeHtml(order.status || "Pending")}">${escapeHtml(order.status || "Pending")}</span>
      </div>
      <div class="order-stepper">
        ${ORDER_STATUSES.map(
          (st, idx) => `<div class="step-node ${idx <= stepIdx ? "done" : ""}">${st}</div>`
        ).join("")}
      </div>
      <p class="muted-note">
        <strong>${escapeHtml(order.customerName)}</strong> · ${escapeHtml(order.city || "Dhaka")} ·
        ${(order.items || []).map((i) => `${escapeHtml(i.title)} (×${i.qty})`).join(", ")} ·
        <strong>${formatBDT(order.total)}</strong>
      </p>
    </div>
  `;
}

function renderOrdersModal() {
  const container = document.getElementById("ordersListContainer");
  const myOrders = state.isAdmin
    ? state.orders
    : state.orders.filter(
        (o) =>
          !state.user ||
          o.userId === state.user.uid ||
          (o.email && o.email.toLowerCase() === (state.user.email || "").toLowerCase()) ||
          o.userId === "guest"
      );

  if (!myOrders.length) {
    container.innerHTML = `<p class="muted-note">No orders placed yet. Complete checkout or look up an Order ID above.</p>`;
    return;
  }

  container.innerHTML = myOrders.map(renderOrderCard).join("");
}

/* ==========================================================================
   13. Authentication & Store Owner (Admin) Atelier Panel
   ========================================================================== */
function updateAuthUI() {
  const slot = document.getElementById("authHeaderSlot");
  const adminBtn = document.getElementById("openAdminBtn");

  if (state.user) {
    const name = state.user.displayName || state.user.email?.split("@")[0] || "Client";
    const initial = name.charAt(0).toUpperCase();
    slot.innerHTML = `
      <div class="user-chip">
        <span class="user-avatar" aria-hidden="true">${escapeHtml(initial)}</span>
        <span class="user-name">${escapeHtml(name)}</span>
        <button type="button" class="signout-mini" id="signOutBtn">Sign out</button>
      </div>
    `;
    document.getElementById("signOutBtn").addEventListener("click", async () => {
      await signOut(auth);
      showToast("Signed out of Abhoron.");
    });
  } else {
    slot.innerHTML = `
      <button type="button" class="btn-ghost-glass" id="openAuthBtn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20c0-3.8 3.1-6.5 7-6.5s7 2.7 7 6.5" />
        </svg>
        <span>Sign in</span>
      </button>
    `;
    document.getElementById("openAuthBtn").addEventListener("click", () => openModal("authModal"));
  }

  if (state.isAdmin) {
    adminBtn.classList.remove("hidden");
    document.getElementById("adminEmailDisplay").textContent = state.user.email;
  } else {
    adminBtn.classList.add("hidden");
  }
}

function renderAdminPanel() {
  if (!state.isAdmin) return;

  const totalRevenue = state.orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const lowStock = state.products.filter((p) => Number(p.stock) <= 6).length;
  const activeOrders = state.orders.filter((o) => o.status !== "Delivered").length;

  document.getElementById("adminKpiStrip").innerHTML = `
    <div class="admin-kpi"><span>Catalog Pieces</span><strong>${state.products.length}</strong></div>
    <div class="admin-kpi"><span>Total Revenue</span><strong>${formatBDT(totalRevenue)}</strong></div>
    <div class="admin-kpi"><span>Active Orders</span><strong>${activeOrders}</strong></div>
    <div class="admin-kpi"><span>Low Stock Alerts</span><strong>${lowStock}</strong></div>
  `;

  // Inventory table
  document.getElementById("adminInventoryBody").innerHTML = state.products
    .map(
      (p) => `
      <tr>
        <td>
          <strong>${escapeHtml(p.title)}</strong><br>
          <span class="sku-tag">${escapeHtml(p.sku)}</span>
        </td>
        <td>${escapeHtml(p.category)}</td>
        <td>
          <input type="number" class="admin-inline-input" data-edit-price="${escapeHtml(p.id)}" value="${p.price}" min="500" step="50" />
        </td>
        <td>
          <input type="number" class="admin-inline-input" data-edit-stock="${escapeHtml(p.id)}" value="${p.stock}" min="0" />
        </td>
        <td>
          <button type="button" class="btn-outline-gold btn-sm" data-save-prod="${escapeHtml(p.id)}">Save</button>
          <button type="button" class="btn-danger-soft" data-del-prod="${escapeHtml(p.id)}">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");

  // Orders management list
  const ordersWrap = document.getElementById("adminOrdersList");
  if (!state.orders.length) {
    ordersWrap.innerHTML = `<p class="muted-note">No customer orders recorded yet.</p>`;
  } else {
    ordersWrap.innerHTML = state.orders
      .map(
        (o) => `
        <div class="order-card">
          <div class="order-card-head">
            <div>
              <strong class="mono-id" style="font-size:1.05rem">${escapeHtml(o.orderId)}</strong>
              <span> · ${escapeHtml(o.customerName)} (${escapeHtml(o.phone || o.email || "")})</span>
            </div>
            <select class="admin-status-select" data-order-status="${escapeHtml(o.orderId)}">
              ${ORDER_STATUSES.map(
                (st) => `<option value="${st}" ${o.status === st ? "selected" : ""}>${st}</option>`
              ).join("")}
            </select>
          </div>
          <p class="muted-note">
            ${escapeHtml(o.address || "")}, ${escapeHtml(o.city || "")} ·
            ${(o.items || []).map((i) => `${escapeHtml(i.title)} ×${i.qty}`).join(", ")} ·
            <strong>${formatBDT(o.total)}</strong> (${escapeHtml(o.paymentMethod || "COD")})
          </p>
        </div>
      `
      )
      .join("");
  }
}

async function seedCuratedCatalogToFirestore() {
  if (!state.isAdmin) return;
  try {
    await Promise.all(
      DEFAULT_PRODUCTS.map((p) =>
        setDoc(doc(db, "abhoron_products", p.id), { ...p, updatedAt: serverTimestamp() }, { merge: true })
      )
    );
    showToast("All 12 curated couture pieces synced to Firestore.");
  } catch (err) {
    showToast(`Firestore sync notice: ${err.message}`);
  }
}

/* ==========================================================================
   14. Modal Helpers & Event Wiring
   ========================================================================== */
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
  const anyOpen = document.querySelector(".modal-overlay:not(.hidden)");
  if (!anyOpen) document.body.style.overflow = "";
}

function wireEvents() {
  // Close modal buttons & backdrop click
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCartDrawer();
      document.querySelectorAll(".modal-overlay:not(.hidden)").forEach((m) => closeModal(m.id));
    }
  });

  // Hero spotlight quick-view
  const openFlagship = () => openQuickView((state.products[0] || DEFAULT_PRODUCTS[0]).id);
  document.getElementById("heroShowcaseCard").addEventListener("click", openFlagship);
  document.getElementById("heroQuickSpotlightBtn").addEventListener("click", openFlagship);

  // Header & Footer navigation buttons
  document.getElementById("openCartBtn").addEventListener("click", openCartDrawer);
  document.getElementById("closeCartBtn").addEventListener("click", closeCartDrawer);
  document.getElementById("cartBackdrop").addEventListener("click", closeCartDrawer);

  document.getElementById("openOrdersBtn").addEventListener("click", () => {
    renderOrdersModal();
    openModal("ordersModal");
  });
  document.getElementById("footerOrdersBtn").addEventListener("click", () => {
    renderOrdersModal();
    openModal("ordersModal");
  });
  document.getElementById("openHeritageBtn").addEventListener("click", () => {
    document.getElementById("featured-craft").scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("footerAuthBtn").addEventListener("click", () => openModal("authModal"));

  document.getElementById("navWishlistBtn").addEventListener("click", () => {
    state.filters.category = "__wishlist";
    syncCategoryPills();
    renderCatalog();
    document.getElementById("collection").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("openAdminBtn").addEventListener("click", () => {
    if (!state.isAdmin) return;
    renderAdminPanel();
    openModal("adminModal");
  });

  // Catalog filters
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.filters.search = e.target.value;
    renderCatalog();
  });

  document.getElementById("priceRangeInput").addEventListener("input", (e) => {
    state.filters.maxPrice = Number(e.target.value);
    document.getElementById("priceRangeValue").textContent = formatBDT(state.filters.maxPrice);
    renderCatalog();
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.filters.sort = e.target.value;
    renderCatalog();
  });

  document.getElementById("categoryPills").addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-pill");
    if (!btn) return;
    state.filters.category = btn.dataset.category;
    syncCategoryPills();
    renderCatalog();
  });

  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    state.filters = { search: "", category: "all", maxPrice: 25000, sort: "featured" };
    document.getElementById("searchInput").value = "";
    document.getElementById("priceRangeInput").value = "25000";
    document.getElementById("priceRangeValue").textContent = "৳25,000";
    document.getElementById("sortSelect").value = "featured";
    syncCategoryPills();
    renderCatalog();
  });

  // Product Grid delegation
  document.getElementById("productGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;

    if (action === "wishlist") {
      e.stopPropagation();
      if (state.wishlist.includes(id)) {
        state.wishlist = state.wishlist.filter((w) => w !== id);
        showToast("Removed from wishlist.");
      } else {
        state.wishlist.push(id);
        showToast("Saved to your wishlist.");
      }
      saveLocal("abhoron_wishlist", state.wishlist);
      renderCatalog();
    } else if (action === "quickview") {
      openQuickView(id);
    } else if (action === "add-cart") {
      addToCart(id);
    }
  });

  // Cart drawer delegation
  document.getElementById("cartItemsList").addEventListener("click", (e) => {
    const dec = e.target.closest("[data-cart-dec]");
    const inc = e.target.closest("[data-cart-inc]");
    const rem = e.target.closest("[data-cart-rem]");
    if (dec) updateCartQty(dec.dataset.cartDec, -1);
    else if (inc) updateCartQty(inc.dataset.cartInc, 1);
    else if (rem) {
      state.cart = state.cart.filter((i) => i.key !== rem.dataset.cartRem);
      saveLocal("abhoron_cart", state.cart);
      renderCart();
    }
  });

  // Promo code form
  document.getElementById("promoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("promoInput").value.trim().toUpperCase();
    const fb = document.getElementById("promoFeedback");

    if (PROMO_CODES[code]) {
      state.promoCode = code;
      saveLocal("abhoron_promo", code);
      fb.className = "promo-feedback ok";
      fb.textContent = `Applied ${code} — ${PROMO_CODES[code].label}!`;
      renderCart();
    } else {
      fb.className = "promo-feedback err";
      fb.textContent = "Invalid promo code. Try ABHORON15 for 15% off.";
    }
  });

  // Checkout triggers
  document.getElementById("proceedCheckoutBtn").addEventListener("click", openCheckoutModal);
  document.getElementById("coCity").addEventListener("change", renderCheckoutSummary);
  document.getElementById("checkoutForm").addEventListener("submit", handleCheckoutSubmit);
  document.getElementById("receiptTrackBtn").addEventListener("click", () => {
    closeModal("checkoutModal");
    renderOrdersModal();
    openModal("ordersModal");
  });

  // Order lookup
  document.getElementById("trackLookupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("trackLookupInput").value.trim().toUpperCase();
    const resEl = document.getElementById("trackLookupResult");
    if (!q) {
      resEl.innerHTML = "";
      return;
    }
    const found = state.orders.find((o) => (o.orderId || "").toUpperCase() === q);
    resEl.innerHTML = found
      ? `<div style="margin-bottom:1rem">${renderOrderCard(found)}</div>`
      : `<p class="form-error">No order found matching "${escapeHtml(q)}".</p>`;
  });

  // Auth modal tabs & actions
  document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.authMode = tab.dataset.authMode;
      document.querySelectorAll("[data-auth-mode]").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const isReg = state.authMode === "register";
      document.getElementById("authNameWrap").classList.toggle("hidden", !isReg);
      document.getElementById("authSubmitBtn").textContent = isReg ? "Create Account" : "Sign In";
      document.getElementById("authErrorMsg").classList.add("hidden");
    });
  });

  document.getElementById("googleSignInBtn").addEventListener("click", async () => {
    const errEl = document.getElementById("authErrorMsg");
    errEl.classList.add("hidden");
    try {
      await signInWithPopup(auth, googleProvider);
      closeModal("authModal");
      showToast("Signed in with Google.");
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove("hidden");
    }
  });

  document.getElementById("emailAuthForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("authErrorMsg");
    errEl.classList.add("hidden");
    const email = document.getElementById("authEmailInput").value.trim();
    const pass = document.getElementById("authPassInput").value;
    const name = document.getElementById("authNameInput").value.trim();

    try {
      if (state.authMode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        if (name) await updateProfile(cred.user, { displayName: name });
        showToast("Welcome to Abhoron Couture.");
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
        showToast("Signed in to Abhoron.");
      }
      closeModal("authModal");
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove("hidden");
    }
  });

  // Admin modal tabs & actions
  document.querySelectorAll("[data-admin-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.adminTab;
      document.querySelectorAll("[data-admin-tab]").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("adminTabInventory").classList.toggle("hidden", target !== "inventory");
      document.getElementById("adminTabAdd").classList.toggle("hidden", target !== "add");
      document.getElementById("adminTabOrders").classList.toggle("hidden", target !== "orders");
    });
  });

  document.getElementById("seedFirestoreBtn").addEventListener("click", seedCuratedCatalogToFirestore);

  document.getElementById("adminInventoryBody").addEventListener("click", async (e) => {
    const saveBtn = e.target.closest("[data-save-prod]");
    const delBtn = e.target.closest("[data-del-prod]");

    if (saveBtn) {
      const id = saveBtn.dataset.saveProd;
      const price = Number(document.querySelector(`[data-edit-price="${id}"]`).value);
      const stock = Number(document.querySelector(`[data-edit-stock="${id}"]`).value);
      const target = state.products.find((p) => p.id === id);
      if (!target) return;

      target.price = price;
      target.stock = stock;
      try {
        await setDoc(doc(db, "abhoron_products", id), { ...target, updatedAt: serverTimestamp() }, { merge: true });
        showToast(`Updated ${target.title} in Firestore.`);
      } catch {
        showToast(`Updated ${target.title} locally.`);
      }
      renderCatalog();
      renderAdminPanel();
    } else if (delBtn) {
      const id = delBtn.dataset.delProd;
      try {
        await deleteDoc(doc(db, "abhoron_products", id));
      } catch {
        // fallback local removal
      }
      state.products = state.products.filter((p) => p.id !== id);
      renderCatalog();
      renderAdminPanel();
      showToast("Product removed from catalog.");
    }
  });

  document.getElementById("adminAddProductForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = `abh-custom-${Date.now()}`;
    const sku = `ABH-${Math.floor(100 + Math.random() * 900)}`;
    const category = document.getElementById("apCategory").value;
    const primaryColor = document.getElementById("apColorPrimary").value;
    const accentColor = document.getElementById("apColorAccent").value;

    const newProd = {
      id,
      sku,
      title: document.getElementById("apTitle").value.trim(),
      category,
      price: Number(document.getElementById("apPrice").value),
      stock: Number(document.getElementById("apStock").value),
      rating: 4.9,
      featured: true,
      fabric: document.getElementById("apFabric").value.trim(),
      origin: "Abhoron Dhaka Atelier",
      pattern: document.getElementById("apPattern").value,
      primaryColor,
      accentColor,
      sizes:
        category === "Jamdani Sarees" || category === "Zari Shawls"
          ? ["Free Size"]
          : ["S", "M", "L", "XL"],
      colors: [{ name: "Atelier Custom", hex: primaryColor }],
      description: document.getElementById("apDescription").value.trim()
    };

    try {
      await setDoc(doc(db, "abhoron_products", id), { ...newProd, createdAt: serverTimestamp() });
      showToast(`Published "${newProd.title}" to Firestore!`);
    } catch {
      state.products.unshift(newProd);
      showToast(`Published "${newProd.title}" to storefront.`);
    }

    e.target.reset();
    renderCatalog();
    renderAdminPanel();
  });

  document.getElementById("adminOrdersList").addEventListener("change", async (e) => {
    const sel = e.target.closest("[data-order-status]");
    if (!sel) return;
    const orderId = sel.dataset.orderStatus;
    const status = sel.value;

    const target = state.orders.find((o) => o.orderId === orderId);
    if (target) target.status = status;

    const localOrders = loadLocal("abhoron_local_orders", []);
    const localMatch = localOrders.find((o) => o.orderId === orderId);
    if (localMatch) {
      localMatch.status = status;
      saveLocal("abhoron_local_orders", localOrders);
    }

    try {
      await updateDoc(doc(db, "abhoron_orders", orderId), { status, updatedAt: serverTimestamp() });
      showToast(`Order ${orderId} marked as ${status}.`);
    } catch {
      showToast(`Order ${orderId} updated to ${status}.`);
    }
    renderAdminPanel();
  });
}

function syncCategoryPills() {
  document.querySelectorAll(".cat-pill").forEach((pill) => {
    const active = pill.dataset.category === state.filters.category;
    pill.classList.toggle("active", active);
    pill.setAttribute("aria-selected", String(active));
  });
}

/* ==========================================================================
   15. Bootstrap
   ========================================================================== */
function bootstrap() {
  wireEvents();
  renderHeroArtwork();
  renderCatalog();
  renderCart();
  bind3DTilt(document);
  initFirestoreListeners();

  onAuthStateChanged(auth, (user) => {
    state.user = user || null;
    state.isAdmin = Boolean(
      user && ADMIN_EMAILS.includes((user.email || "").toLowerCase())
    );
    updateAuthUI();
    if (user) syncUserProfileToFirestore(user);
    if (state.isAdmin) renderAdminPanel();
  });
}

bootstrap();
