# Aromiq.lk — MERN Project

Luxury Arabic perfume e-commerce site. Black-and-gold design, converted from an
earlier PHP version and now rebuilt as a MERN (MongoDB, Express, React, Node) app.

## Structure

```
aromiqlk-mern-project/
├── frontend/     React + Vite + Tailwind CSS
└── backend/      Express + MongoDB (Mongoose)
```

## Current status: UI-only pass

This pass focused on the **frontend UI only**. All pages (`Home`, `Shop`, `About`,
`Contact`, `ProductDetails`) currently use small static arrays of sample data
directly inside each page file — the same placeholder products used throughout
the project so far. Nothing is fetched from the backend yet.

The `backend/` folder already has a working Express + MongoDB API (product
routes, contact route, seed script) from an earlier pass — it isn't wired up to
the frontend yet. Connecting `Shop.jsx`, `Home.jsx`, and `ProductDetails.jsx` to
fetch from `/api/products` instead of their local arrays is the natural next step.

## Styling approach

No separate `.css` files for components — all styling lives directly in each
`.jsx` file as Tailwind utility classes (e.g. `className="bg-panel border border-line ..."`),
matching the pattern in the example component you shared. The color palette
(gold, ink, panel, warm, muted) is defined once in `frontend/tailwind.config.js`
so every page pulls from the same design tokens instead of repeating hex codes.

`frontend/src/index.css` only contains the three `@tailwind` directives — it's
not a stylesheet in the traditional sense, just what pulls Tailwind into the build.

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`).

## Running the backend (when you're ready to connect it)

```bash
cd backend
npm install
npm run seed     # loads sample products into MongoDB
npm run dev       # starts on http://localhost:5000
```
You'll need MongoDB running locally, or a MongoDB Atlas connection string in
`backend/.env` (copy `.env.example` and fill in `MONGO_URI`).
