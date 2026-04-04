# Bidhan Pant — Portfolio (React + Vite)

## Folder Structure

```
bidhan-portfolio/
├── index.html                  ← HTML entry point
├── vite.config.js              ← Vite config
├── package.json
│
├── public/
│   └── images/
│       ├── profile.png         ← Your profile photo (add this!)
│       └── favicon.png         ← Your favicon (add this!)
│
└── src/
    ├── main.jsx                ← React root entry
    ├── App.jsx                 ← Root component (wires everything together)
    │
    ├── styles/
    │   └── global.css          ← Global CSS variables, resets, shared styles
    │
    ├── hooks/
    │   └── useScrollReveal.js  ← Intersection Observer for scroll animations
    │
    ├── data/                   ← All content lives here — easy to update
    │   ├── services.js         ← 6 service cards
    │   ├── resume.js           ← Experience, education, skills, competencies
    │   ├── projects.js         ← 6 portfolio projects
    │   └── articles.js         ← 3 blog articles (full body content)
    │
    └── components/
        ├── Cursor.jsx / .module.css        ← Custom animated cursor
        ├── Header.jsx / .module.css        ← Sticky nav + mobile menu
        ├── Hero.jsx / .module.css          ← Home section + typed text + orbit
        ├── Services.jsx / .module.css      ← 6 service cards grid
        ├── Resume.jsx / .module.css        ← Tabbed resume/skills section
        ├── Portfolio.jsx / .module.css     ← Filterable project grid
        ├── Blog.jsx / .module.css          ← Article cards
        ├── ArticleModal.jsx / .module.css  ← Modal for reading full articles
        ├── Contact.jsx / .module.css       ← Contact form + info
        ├── Footer.jsx / .module.css        ← Footer with links
        └── BackToTop.jsx / .module.css     ← Scroll-to-top button
```

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Add your images
Place these files in `public/images/`:
- `profile.png` — your profile photo (recommended: 500×500px square)
- `favicon.png` — your favicon (recommended: 64×64px)

### 3. Update your links
Open `src/components/Hero.jsx` and update your LinkedIn, GitHub, and email links.
Open `src/components/Contact.jsx` to update contact details.

### 4. Run the dev server
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

### 5. Build for production
```bash
npm run build
```
Output goes to the `dist/` folder. Deploy to Netlify, Vercel, or GitHub Pages.

## Customising Content

All content is separated into `/src/data/` files so you never need to touch components:

| File | What to edit |
|------|-------------|
| `services.js` | Service cards, icons, descriptions, tags |
| `resume.js` | Job history, education, skills, percentages |
| `projects.js` | Portfolio projects, categories, links |
| `articles.js` | Blog article titles, summaries, full body |

## Tech Stack
- **React 18** + **Vite 5**
- **CSS Modules** (scoped styles per component)
- No external UI libraries — fully custom
- Fonts: Outfit + Nunito (Google Fonts)
- Icons: Boxicons
