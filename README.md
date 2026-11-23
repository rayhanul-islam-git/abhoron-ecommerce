# Abhoron (আভরণ) — Luxury Bengali Couture & Handloom E-Commerce

**Live Deployment:** [https://uftb-abhoron-ecommerce.vercel.app](https://uftb-abhoron-ecommerce.vercel.app)  
**Course:** E-Commerce, Digital Marketing and Cyber Security Lab (ICT 4364)  
**Institution:** University of Frontier Technology, Bangladesh

## Overview

**Abhoron (আভরণ)** is a luxury e-commerce web application celebrating Bangladeshi handloom couture — including Dhakai Jamdani sarees, GI-certified Rajshahi mulberry silk panjabis, handspun muslin kurtis, Comilla khadi shirts, and antique zari shawls.

Designed with a **Royal Bengali Heritage & Champagne-Burgundy Editorial Crystal** aesthetic, the storefront pairs frosted champagne glass panels over editorial textile photography with interactive 3D perspective hover-tilt product cards, bespoke woven-motif SVG textile previews, and live Firebase Authentication & Cloud Firestore persistence.

## Key Features

- **Curated Couture Catalog (12 Pieces in BDT ৳):** Filter by category (*Jamdani Sarees*, *Silk Panjabi*, *Muslin Kurtis*, *Handloom Shirts*, *Zari Shawls*), max price slider, live keyword search, wishlist toggle, and sorting (Featured, Price Low–High, Price High–Low, Top Rated).
- **3D Interactive Product Showcase:** Smooth pointer-tracked CSS 3D perspective hover-tilt (`rotateX` / `rotateY`) with dynamic antique-gold specular glare sheen and live color-swatch woven SVG preview inside Quick View.
- **Shopping Bag & Checkout Flow:** Slide-over shopping bag with quantity controls, promo code redemption (`ABHORON15` for 15% off), automatic complimentary courier over ৳10,000, Cash on Delivery / bKash / Card payment selection, and generated Order IDs (`ABH-XXXX`) persisted to Cloud Firestore (`abhoron_orders`).
- **Firebase Auth & Store Owner RBAC:** Supports Google Sign-In, Email/Password login & registration, and Guest shopping. Authorized store owners (`ADMIN_EMAILS`) unlock the **Admin Atelier Panel** to publish new products, edit prices/stock inline, delete items (`abhoron_products`), and update live customer order statuses (`Pending` → `Processing` → `Shipped` → `Delivered`).
- **Live Order Tracking:** Clients can view order history and look up any `ABH-XXXX` order with a 4-stage fulfillment stepper.

## Tech Stack

- **Frontend:** Semantic HTML5, Modern CSS3 (Glassmorphism, CSS 3D Transforms, Responsive Grid), Modular ES6 JavaScript
- **Backend & Database:** Firebase Authentication (Google + Email/Password) & Cloud Firestore (`abhoron_products`, `abhoron_orders`, `abhoron_users`)
- **Typography:** Cormorant Garamond, Outfit, JetBrains Mono
- **Deployment:** Vercel Static Hosting

## Local Development

Serve the directory with any static server:

```bash
npx serve .
```

Syntax check:

```bash
node --check app.js
```
