# Rosé & Gold — Luxury Mini Jewelry Store

> **Elegance in Every Detail**

A complete, functional MERN-stack (MongoDB, Express, React, Node.js) mini e-commerce website for a luxury jewelry brand. It includes a public customer storefront, secure authentication, a shopping cart & checkout, an order history, and a protected **admin dashboard** with a **Website Customization** panel that lets you change the logo, homepage banner, text, and product images — live, without redeploying.

---

## ✨ Features

### Public storefront
- Beautiful luxury homepage with a hero banner, category grid, featured products, and new arrivals
- Shop page with **search**, **category filter**, and **price range filter** + pagination
- Product details page with image gallery, stock status, and quantity selector
- Cart (add, update quantity, remove, clear) persisted in `localStorage`
- **Cash on Delivery** checkout (demo) with a server-validated total
- Order confirmation page
- Customer registration, login, and logout (JWT + bcrypt)
- My Account with **profile editing** and **order history**
- About Us and Contact Us pages

### Admin dashboard (protected)
- Dashboard with stats (products, orders, revenue, pending)
- Full product **CRUD** (create, edit, delete) with image uploads to Cloudinary
- View all orders and update order **statuses** (Pending → Processing → Shipped → Delivered / Cancelled)
- **Website Customization** section:
  - Upload / replace / remove the **logo**
  - Upload / replace / remove the **homepage banner**
  - Edit homepage **hero title**, **subtitle**, **tagline**, and about text
  - Edit **announcement bar** and **contact information**
  - Select **featured products** for the homepage
  - Changes appear live immediately after saving (with cache-busting)

### Security
- Passwords hashed with **bcryptjs**
- JWT authentication and admin authorization on both frontend and backend
- **Server-side price & stock validation** at checkout (never trusts the browser)
- Input validation with **express-validator**
- Protected admin upload routes
- CORS whitelist via `CLIENT_URL`
- Secret keys only in backend `.env` (never in the React app)

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Database | MongoDB Atlas + Mongoose |
| Backend | Node.js + Express.js |
| Frontend | React.js (Vite) + React Router |
| Auth | JWT + bcryptjs |
| Images | Cloudinary (persistent storage) |
| Validation | express-validator |
| Deployment | Vercel (monorepo — frontend + backend) |

---

## 📁 Project Structure

```
rose-gold/
├── client/                     # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/         # Navbar, Footer, Logo, ProductCard, etc.
│   │   ├── context/            # Auth, Cart, Settings contexts
│   │   ├── pages/              # Public + customer pages
│   │   │   └── admin/          # Admin dashboard pages
│   │   ├── services/           # Axios API service modules
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express backend
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── seed.js             # Seeds admin user, products, settings
│   ├── middleware/
│   │   ├── auth.js             # protect + admin middleware
│   │   └── errorHandler.js
│   ├── models/                 # User, Product, Order, WebsiteSettings
│   ├── routes/                 # auth, products, orders, settings, upload
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
├── .env.example                # backend env reference (also copy to server/.env)
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ and npm
- A MongoDB Atlas account (free tier works)
- A Cloudinary account (free tier works) — needed only for image uploads

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables

**Backend** — create `server/.env` (copy from `rose-gold/.env.example`):

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/rose-gold?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@rosegold.com
ADMIN_PASSWORD=Admin@12345
```

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Frontend** — create `client/.env` (copy from `client/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the database (creates admin + sample products)

```bash
cd server
npm run seed
```

This creates:
- **Admin login:** `admin@rosegold.com` / `Admin@12345`
- 12 sample jewelry products with real images
- Default website settings (banner, hero text, etc.)

### 4. Start both servers

Open **two terminals**:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd client
npm run dev
```

Visit **http://localhost:3000**.

---

## 🖼️ How to Change the Logo, Banner & Product Images (No Code!)

1. Log in as admin (`admin@rosegold.com` / `Admin@12345`).
2. You'll be redirected to the **Admin Panel**. Click **Customization** in the sidebar.
3. **Logo:** scroll to *Branding* → choose a file under *Logo* → it uploads to Cloudinary and previews. Click **Save Changes**.
4. **Banner:** scroll to *Homepage Banner* → choose a file → preview → **Save Changes**.
5. **Homepage text / contact info / announcement:** edit the fields → **Save Changes**.
6. **Featured products:** tick the products you want on the homepage → **Save Changes**.
7. **Product images:** go to **Products** in the sidebar → click **Edit** on a product → upload/replace/remove images → **Update Product**.

Because each upload is given a unique versioned URL (`?v=timestamp`), the new image appears on the live site immediately — no redeploy required.

> ⚠️ **Image uploads require Cloudinary credentials** in `server/.env`. Without them, product/setting records still work, but uploads will fail.

---

## 🌐 Deployment (Vercel — Monorepo)

This project is configured as a **Vercel Monorepo**: the frontend (`client/`) and
backend (`server/`) are deployed together from a single GitHub repo using the
[`vercel.json`](vercel.json) at the project root. Vercel's rewrite routes
`/api/*` to the serverless backend and everything else to the Vite frontend.

### Step A — MongoDB Atlas (database)
1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. **Database Access** → add a database user with a password.
3. **Network Access** → allow access from anywhere (`0.0.0.0/0`) for cloud hosting.
4. **Connect → Drivers** → copy the connection string and replace `<password>`.
5. This is your `MONGODB_URI`.

### Step B — Cloudinary (image storage)
1. Create a free account at https://cloudinary.com.
2. On the **Dashboard**, note your **Cloud name**, **API Key**, and **API Secret**.
3. These become `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Step C — Deploy to Vercel
1. Push your project to GitHub.
2. Go to https://vercel.com → **New Project** → import the same repo.
3. Vercel will auto-detect the monorepo from `vercel.json`. Confirm the settings:
   - **Root Directory:** (leave as the repo root — `vercel.json` defines the services)
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (per service)
   - **Output Directory:** `dist` (per service)
4. Add the **Environment Variables** below (Project → Settings → Environment Variables).
5. Click **Deploy**.

### Environment Variables to add in Vercel
Add these in **Project → Settings → Environment Variables** (they are read by the
backend serverless function at runtime):

| Variable | Value | Belongs to |
|----------|-------|-----------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | Backend |
| `JWT_SECRET` | A long random string (see below) | Backend |
| `JWT_EXPIRES_IN` | `7d` | Backend |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Backend |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Backend |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Backend |
| `CLIENT_URL` | Your deployed frontend URL, e.g. `https://rose-gold.vercel.app` | Backend |
| `ADMIN_EMAIL` | Admin login email (used when auto-seeding) | Backend |
| `ADMIN_PASSWORD` | Admin login password (used when auto-seeding) | Backend |

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Frontend note:** The client uses a relative `/api` path, so **no** `VITE_API_URL`
> is needed on Vercel. Do **not** add frontend secrets — `VITE_*` vars are public.

### Seeding the database
On first deploy, the backend auto-seeds the admin user, sample products, and
default settings when it detects an empty database. If you need to re-seed,
run `npm run seed` from the `server/` directory locally (or via a one-off
script) against the same `MONGODB_URI`.

### ✅ Deployment verification checklist
- [ ] Backend health check works: `GET https://your-app.vercel.app/api/health`
- [ ] Products load on the deployed shop page
- [ ] Registration & login work in production
- [ ] Placing an order works and appears in My Account
- [ ] Admin login works and the dashboard loads
- [ ] Logo / banner / product image uploads succeed and show live (requires Cloudinary)

---

## 🔑 Setup steps that need YOUR accounts

You must create these accounts and paste the credentials into your env vars / hosting dashboards:

| Service | What you need | Where it goes |
|---------|---------------|---------------|
| MongoDB Atlas | Cluster + DB user + connection string | `MONGODB_URI` |
| Cloudinary | Cloud name, API key, API secret | `CLOUDINARY_*` |
| Vercel | Account + project | Frontend + backend hosting (monorepo) |

> The app **cannot** create these accounts for you — MongoDB Atlas, Cloudinary, and Vercel all require your own sign-up and credentials.

---

## 📜 NPM Scripts

### Backend (`server/`)
| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon (development) |
| `npm start` | Start with node (production) |
| `npm run seed` | Seed admin user, products, and settings |

### Frontend (`client/`)
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |

---

## 🔒 Security Notes

- Never commit `.env` files — `.gitignore` already excludes them.
- `VITE_*` variables are exposed to the browser. **Never** put secrets there.
- Admin routes are protected on **both** the frontend (`AdminRoute`) and backend (`protect` + `admin` middleware).
- Checkout totals and stock are recalculated on the server; client-supplied prices are ignored.
- Customers cannot grant themselves admin — only the seeded admin user has `isAdmin: true`.

---

## 🧪 Manual Test Checklist

- [ ] Register a new customer and log in / log out
- [ ] Browse, search, and filter products by category and price
- [ ] Add to cart, update quantity, remove items
- [ ] Checkout with Cash on Delivery and see the confirmation page
- [ ] View order history in My Account
- [ ] Log in as admin and confirm admin-only access
- [ ] Create, edit, and delete a product (with image upload)
- [ ] Update an order status
- [ ] Change the logo, banner, and homepage text and confirm they appear live
- [ ] Resize to mobile/tablet and confirm responsiveness

---

© Rosé & Gold — Elegance in Every Detail.
