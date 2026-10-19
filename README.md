# Manish Kumar — Full Stack Developer Portfolio

A modern, high-performance personal portfolio and full-stack CMS built with **Next.js 16 (Turbopack, App Router)**, **React 19**, **TypeScript**, **MongoDB Atlas**, **Cloudinary CDN**, and **Tailwind CSS**.

---

## ✨ Features & Highlights

- **Dynamic Hero & 3D Ambient Canvas**: Cinematic video background with fluid glassmorphism and animated introduction splash video.
- **66+ Verified Certificates Showcase**: Categorized acclamation portfolio with Cloudinary CDN-hosted PDF rendering and instant modal preview.
- **CMS Administration Portal (`/admin`)**:
  - Secure session-based authentication with cryptographically signed HTTP-only cookies.
  - Full CRUD management for certificates, projects, coursework content, and resumes.
  - Zero-hydration mismatch architecture with resilient SSR skeleton states.
- **Resume Management**: Dynamic resume preview (`/api/resume/preview`) and instant attachment download (`/api/resume/download`).
- **Responsive & Accessible**: Fully optimized for mobile, tablet, and ultra-wide screens with ARIA accessibility compliance.
- **SEO & Performance**: Optimized OpenGraph tags, semantic HTML5, JSON-LD Schema markup, and automated sitemap generation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16.4 (App Router & Server Actions) |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons |
| **Database** | MongoDB Atlas (Node.js MongoDB Native Driver v7) |
| **Media & Storage** | Cloudinary CDN (Image & PDF raw delivery) |
| **Deployment** | Vercel (Edge-ready) |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/manish2750/portfolio.git
cd portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the template configuration file:
```bash
cp .env.example .env.local
```

Populate `.env.local` with your credentials:
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
MONGODB_DB=portfolio

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Access
ADMIN_EMAILS=your-admin-email@example.com
ADMIN_PASSWORD=your_secure_password
```

> **Note**: `.env.local` is included in `.gitignore` and must **never** be committed to public version control.

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Compiles production build.
- `npm run start`: Runs production server.
- `npm run lint`: Runs ESLint validation.
- `npm run db:test`: Runs the comprehensive backend verification suite.

---

## 🔒 Security Best Practices

- All database connection strings, Cloudinary secrets, and admin credentials are strictly server-side only and never leaked to the client bundle.
- `.env*` files are strictly ignored by `.gitignore`.
- Admin authentication uses secure, hashed passwords with timing-safe comparison and encrypted HTTP-only session cookies.

---

## 👤 Author

**Manish Kumar**
- **Portfolio**: [manishkumar.dev](https://manishkumar.dev)
- **GitHub**: [@manish2750](https://github.com/manish2750)
- **LinkedIn**: [linkedin.com/in/manishkumar](https://linkedin.com/in/manishkumar)
