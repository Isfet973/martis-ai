# Martis AI — Platform Website

> *Inspired by Britomartis, the Cretan goddess of fishing nets — where gods wove nets, we weave intelligence.*

A complete frontend website for **Martis AI**, a fictional AI model platform (similar to LM Studio) that lets users chat with AI models directly in the browser or download them for local use with full privacy.

---

## Project Structure

```
martis/
├── index.html              # Main landing page
├── README.md               # This file
│
├── styles/
│   ├── tokens.css          # Design tokens (colors, fonts, shared components)
│   └── main.css            # Main page layout styles
│   └── model.css           # Model detail page styles
│
├── scripts/
│   └── shared.js           # All JavaScript: theme, language, catalog, tabs
│
├── pages/
│   ├── martis-model-70b.html     # Martis-70B Instruct detail page
│   ├── martis-model-code.html    # Martis-Code 34B detail page
│   ├── martis-model-think.html   # Martis-Think 13B detail page
│   ├── martis-model-write.html   # Martis-Write 7B detail page
│   ├── martis-model-vision.html  # Martis-Vision 13B detail page
│   └── martis-model-voice.html   # Martis-Voice 3B detail page
│
└── assets/                 # (empty — for future icons, images, fonts)
```

---

## Pages Overview

### `index.html` — Main Landing Page

The main marketing and product page. Contains:

1. **Navigation bar** — Logo (SVG fishing net), nav links, language toggle (EN/PT), theme toggle (dark/light), Sign In and Start Free buttons.

2. **Hero section** — Left: headline *"Where the net becomes divine"*, tagline referencing Britomartis, stats (47+ models, 128K context, 100% private, 0 setup), CTA buttons. Right: live chat preview with model tabs (7B, 13B, 70B, Code), sample conversation with Python code example.

3. **Model Showcase section** (`#chat-full`) — 6 clickable tabs, one per model. Each tab reveals a two-column panel: left side has model description, 4 strengths, and a visual benchmark bar chart comparing against real competitors (GPT-4o, Gemini, Claude, DeepSeek, Copilot, Whisper, etc.). Right side shows a realistic demo conversation specific to that model.

4. **Catalog section** (`#catalog`) — Two-column vertical list of 14 AI models. First 5 per column are visible; remaining cards hidden behind a "Show more models" button. Each card is fully clickable and navigates to the model's detail page. Cards show: colored stripe by category, emoji icon, model name, metadata (params/context/size/quantization), description comparing to real AI competitors, rival badges (vs GPT-4o, Claude, DeepSeek, etc.), and a download button.

5. **How It Works section** (`#how`) — 3 steps: Use in Browser → Download Locally → Integrate via API.

6. **Footer** — Brand info, product/model/company link columns, mythology tagline.

---

### `pages/martis-model-[id].html` — Individual Model Pages

Each of the 6 models has its own detail page with:

1. **Breadcrumb** — Martis AI / Catalog / [Model Name]
2. **Hero** — Model name, tagline (bilingual), spec pills (params/context/size/quantization), How to Download and See Demo CTAs, benchmark score card.
3. **What it does** — Detailed description + use case list (bilingual).
4. **Why it's better** — Competitive advantage text + visual benchmark bar chart comparing to 3 named real-world AI competitors.
5. **Demo** — A realistic sample conversation specific to that model's specialty.
6. **Installation Tutorial** — 4 steps: Install Martis CLI → Download model → Run model (terminal or API) → Integrate with Python (OpenAI-compatible).

---

## Design System (`styles/tokens.css`)

### Color Palette

| Token | Dark | Light | Purpose |
|-------|------|-------|---------|
| `--bg` | `#0c0f1a` | `#f9f7f3` | Page background |
| `--surface` | `#161b2e` | `#fefdfb` | Card/panel background |
| `--accent` | `#4f82c4` | `#2b6ab4` | Primary blue accent |
| `--purple` | `#7c5cbf` | `#6040a8` | Secondary purple |
| `--grad` | blue→purple | blue→purple | Gradient (buttons, highlights) |
| `--green` | `#3ab89a` | `#1b9472` | Success / new badges |
| `--amber` | `#c49d4a` | `#9c7624` | Warning / write model |
| `--rose` | `#b05f88` | `#8f3a62` | Vision model / alerts |
| `--sky` | `#3d8ec4` | `#2278b0` | Code model |

**Light mode** uses warm parchment tones (`#f9f7f3` base) — intentionally warm and low-contrast to avoid eye strain when switching from dark mode.

### Typography

- **Fraunces** (serif, Google Fonts) — Headlines, numbers, logo. Weights: 300 (italic), 700, 900.
- **DM Sans** (sans-serif, Google Fonts) — Body text, UI elements. Weights: 300, 400, 500, 600.

### Category Colors (model card stripes)

| Category | Gradient |
|----------|----------|
| Chat | blue → purple |
| Code | sky → green |
| Think/Math | green → blue |
| Write | amber → orange |
| Vision | rose → amber |
| Voice | purple → rose |

---

## JavaScript (`scripts/shared.js`)

All JavaScript lives in a single shared file loaded by every page.

### Features

**Language system** (`setLang(lang)`)
- Switches between `'en'` (English, no accents) and `'pt'` (Portuguese with full accents: Catálogo, Início, Britomártis, etc.)
- Saves selection to `localStorage` under key `martis_lang`
- On page load, reads saved preference — user never needs to re-select when navigating between pages
- All translatable text uses `data-pt="..."` and `data-en="..."` attributes; JS swaps `textContent` on every matching element

**Theme system** (`toggleTheme()`)
- Toggles `data-theme="dark"` / `data-theme="light"` on `<html>`
- Saves to `localStorage` under key `martis_theme`
- Restored on every page load — preference persists across navigation

**Catalog show-more** (`showMoreModels()`)
- Shows/hides cards with class `lcard-extra`
- Button label updates in both languages
- Cards animate in with `fadeInSlide` CSS keyframe

**Showcase tabs** (`showModel(id)`)
- Activates the correct `.sc-panel` and `.sc-tab` by model ID
- IDs: `chat70b`, `code`, `think`, `write`, `vision`, `voice`

**Init on DOMContentLoaded**
- Restores saved theme
- Restores saved language (default `'en'`)

---

## Models in the Catalog

| Model | Category | Size | Compared Against |
|-------|----------|------|-----------------|
| Martis-70B Instruct | Chat | 41 GB | GPT-4o, Claude 3.5, Gemini 1.5 Pro |
| Martis-Code 34B | Code | 20 GB | GitHub Copilot, DeepSeek-Coder, CodeLlama |
| Martis-Think 13B | Reasoning | 8.5 GB | DeepSeek-R1, o1-mini, Gemini Thinking |
| Martis-Write 7B | Writing | 4.1 GB | Gemini Flash, Copilot, Claude Haiku |
| Martis-Vision 13B | Vision | 9.2 GB | GPT-4V, Gemini Vision, Claude Vision |
| Martis-Voice 3B | Audio | 1.8 GB | Whisper v3, ElevenLabs, Azure Speech |
| Martis-7B Flash | Chat | 4.8 GB | GPT-4o-mini, Gemini Flash, Llama 3.1 8B |
| Martis-13B Chat | Chat | 8.2 GB | Llama 3.1 8B, Mistral Medium, Gemma 2 9B |
| Martis-Science 34B | Reasoning | 22 GB | Med-PaLM 2, Galactica, BioMedLM |
| Martis-Translate 7B | Writing | 4.3 GB | DeepL, Google Translate, NLLB-200 |
| Martis-Art 7B | Vision | 5.6 GB | SDXL, Midjourney v5, DALL-E 3 |
| Martis-Security 13B | Code | 8.8 GB | ChatGPT, Copilot, Codex |
| Martis-Agent 34B | Chat | 22 GB | GPT-4 Turbo, Claude Agent, Gemini Ultra |
| Martis-Audio 7B | Audio | 4.9 GB | Suno v3, Udio, MusicGen |

---

## Slogan

**English:** *"Where gods wove nets, we weave intelligence."*  
**Portuguese:** *"Onde deuses teciam redes, nós tecemos inteligência."*

**Mythology reference:** Britomartis (Βριτόμαρτις) was a Cretan goddess known for inventing fishing nets. The name "Martis" is taken from the second half of her name. The platform's logo is a SVG fishing net viewed from above — an arc (head rope), horizontal base (lead line with weights), vertical strands, horizontal mesh rows, diagonal weave threads, and knot nodes at every intersection.

---

## Deploying to Vercel / v0

### Option A — Vercel (static site)
1. Put all files in a GitHub repository maintaining the folder structure above
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework Preset: **Other** (static site)
4. Root directory: `/` (or the `martis/` folder if it's nested)
5. Deploy — no build step needed, all files are plain HTML/CSS/JS

### Option B — v0 Recreation Prompt
If you want v0 or another AI to recreate this site exactly, use this prompt:

```
Create a complete frontend website for an AI model platform called "Martis AI".
The platform has two features: chat with AI in the browser, and download models locally.

DESIGN SYSTEM:
- Fonts: Fraunces (serif, for headlines) + DM Sans (sans-serif, for body)
- Dark mode (default): deep navy background #0c0f1a, blue accent #4f82c4, purple #7c5cbf
- Light mode: warm parchment #f9f7f3 (not blue-white — must be easy on eyes)
- Gradient: linear-gradient(135deg, #4f82c4, #7c5cbf) used on all primary buttons
- Logo: SVG fishing net — arc top rope, lead line with 5 rectangular weights at bottom,
  vertical strands, horizontal mesh rows, diagonal weave, knot nodes at intersections

FEATURES TO IMPLEMENT:
1. Sticky navbar: logo, nav links, EN/PT language toggle (saves to localStorage),
   dark/light theme toggle pill (saves to localStorage), Sign In + Start Free buttons
2. Hero section: left=headline + slogan "Where gods wove nets, we weave intelligence" 
   + stats + CTA buttons. Right=live chat preview with model tabs
3. Model showcase section: 6 tabs (70B/Code/Think/Write/Vision/Voice), each showing
   left=description+strengths+benchmark bars vs real AI names, right=demo conversation
4. Catalog: 2-column vertical list, 5 cards per column visible, "show more" button
   reveals 4 more cards. Cards are fully clickable → navigate to model page
5. How it works: 3 steps
6. Footer with mythology tagline

LANGUAGE SYSTEM:
- All UI text has data-pt="..." data-en="..." attributes
- PT uses full Portuguese accents (Catálogo, Início, Começar Grátis, Britomártis)  
- EN has no accents
- Default: English. setLang() function swaps textContent on all [data-pt] elements
- Saved to localStorage key 'martis_lang', restored on every page load

MODEL PAGES (6 separate HTML files):
Each has: breadcrumb, hero with specs, what-it-does + use cases, why-better + benchmark
chart vs 3 real AI competitors (GPT-4o/Claude/Gemini/DeepSeek/Copilot/Whisper etc.),
demo conversation, 4-step install tutorial (CLI install → download → run → Python API)

FILE STRUCTURE:
index.html, styles/tokens.css, styles/main.css, styles/model.css,
scripts/shared.js, pages/martis-model-[id].html (x6)
```

---

## Integrating Real AI APIs (Free, for demos)

### Text — Google Gemini Flash
1. Get a free API key at [aistudio.google.com](https://aistudio.google.com)
2. Call directly from the browser (no backend needed):

```javascript
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  }
);
const data = await res.json();
const reply = data.candidates[0].content.parts[0].text;
```

### Image — Hugging Face (Stable Diffusion XL)
1. Create a free account at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens → New Token (free tier)
3. Call the Inference API from the browser:

```javascript
const res = await fetch(
  "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
  {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_HF_TOKEN' },
    body: JSON.stringify({ inputs: "your image prompt here" })
  }
);
const blob = await res.blob();
document.getElementById('result-img').src = URL.createObjectURL(blob);
```

Both APIs work from plain HTML with no backend server. Free tiers are sufficient for demos and learning projects.

---

## What Was Built (Session Summary)

| Iteration | What Changed |
|-----------|-------------|
| v1 "Tot AI" | First dark-theme site, purple palette, 8 models, static chat UI |
| v2 "Mártis" | Renamed to Mártis, SVG fishing net logo, dark/light toggle, blue-grey palette |
| v3 | Logo improved to open spread fishing net, toggle more visible, accent removed from name (Martis), colors more vibrant with blue+purple, chat preview moved to hero |
| v4 | Model showcase with 6 tabs + demo per model, catalog redesigned as 2-col vertical list with show-more, real AI competitors named (GPT-4o/Claude/Gemini/DeepSeek/Copilot) |
| v5 | Slogan refined, light mode softened (warm parchment), EN/PT language selector, individual model pages (6 HTML files), catalog cards link to model pages |
| v6 (current) | Full project restructure into folders (styles/scripts/pages/assets), external CSS/JS files, localStorage for theme+language persistence, clickable cards, even softer light mode, shorter slogan, this README |
