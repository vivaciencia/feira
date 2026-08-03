# Design System Master File — VIVA Ciência

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** VIVA Ciência — Feira de Ciência Estudantil do Tocantins (Araguaína-TO)  
**Generated & Refined:** 2026-08-01  
**Category:** Science Fair & Educational Innovation Landing  
**Design Dials:** Variance 6/10 (Balanced / Modern) | Motion 7/10 (Standard Parallax/Aurora) | Density 4/10 (Standard / Clean Space)

---

## 0. Design Read
`Reading this as: Event/Conference landing page for K-12 students (EF/EM), educators, and the community of Araguaína-TO, with a vibrant, high-energy institutional science fair language ("Fusão Energética"), leaning toward Aurora UI aesthetics with a dark-to-light theme transition, Exo typography, and asymmetric bento layouts.`

---

## 1. Global Rules

### Color Palette & Theme Transition Rules

| Role | Hex | CSS Variable | Usage Guidelines |
|------|-----|--------------|------------------|
| Hero Background (Dark) | `#0A0E1A` | `--hero-dark` | **Hero Section ONLY** (Color Block Story 1x exception) |
| Hero Glow | `#FFFFFF` / `#80BF41` | `--hero-glow` | Radial glow & Aurora gradient meshes in Hero |
| Primary | `#223D73` | `--color-primary` | Deep institutional blue for headings, navbar, primary cards |
| Primary Mid | `#384C73` | `--color-primary-mid` | Subtitle text, secondary headers, structural borders |
| On Primary | `#FFFFFF` | `--color-on-primary` | High contrast text on dark or blue surfaces |
| Accent / CTA | `#80BF41` | `--color-accent` | Vibrant green for CTA buttons, badge borders, active indicators |
| Accent Light | `#B7D996` | `--color-accent-light` | Hover states, subtle accent pills, icon highlights |
| Page Background | `#F2F2F2` | `--color-background` | **Default background** for all body sections below Hero |
| Text Foreground | `#0A0E1A` | `--color-foreground` | Main body typography (4.5:1+ contrast) |
| Muted | `#E5E7EB` | `--color-muted` | Card backgrounds, neutral containers |
| Border | `#D1D5DB` | `--color-border` | Subtle card borders, section dividers |

> ⚠️ **CRITICAL PALETTE RULE:** Green (`#80BF41`, `#B7D996`) is **STRICTLY BANISHED** as a section background color. Green is exclusively an accent color for interactive elements, highlights, badges, and CTAs.

---

### Typography

- **Display / Headings Font:** **Exo** (`font-family: 'Exo', sans-serif;`)
  - Mood: Science, research, innovation, energetic, precise
- **Body Font:** **Inter** (`font-family: 'Inter', sans-serif;`)
  - Mood: Highly legible, clean, structured
- **Google Fonts Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Exo:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

---

### Spacing & Grid System

- **Density:** 4/10 — Clean visual rhythm with ample breathing room.
- **Asymmetric Bento Grids:** Grid containers for project categories, event highlights, and stats must use asymmetric cell sizing (e.g. 2:1 featured card + 1:1 side cards or staggered spans). Uniform grids of identical cards are strictly banned.
- **Section Transitions:** Clean smooth transition from the cinematic `#0A0E1A` Hero container into the light `#F2F2F2` body background using wave SVG/radial fade dividers.

---

## 2. Component Specs

### Buttons & Call to Actions

```css
/* Primary Button (CTA) */
.btn-primary {
  background: var(--color-accent); /* #80BF41 */
  color: #0A0E1A; /* High-contrast dark text over green */
  padding: 14px 28px;
  border-radius: 10px;
  font-family: 'Exo', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.01em;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(128, 191, 65, 0.35);
}

.btn-primary:hover {
  background: var(--color-accent-light); /* #B7D996 */
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(128, 191, 65, 0.45);
}

/* Secondary Hero Button */
.btn-hero-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  padding: 14px 28px;
  border-radius: 10px;
  font-family: 'Exo', sans-serif;
  font-weight: 600;
  transition: all 250ms ease;
  cursor: pointer;
}

.btn-hero-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}
```

### Cards & Bento Layouts

```css
/* Asymmetric Bento Card (Light Mode Body) */
.bento-card {
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(10, 14, 26, 0.04);
  transition: all 300ms ease;
}

.bento-card:hover {
  border-color: var(--color-primary-mid);
  box-shadow: 0 10px 30px rgba(34, 61, 115, 0.1);
  transform: translateY(-3px);
}

.bento-card-featured {
  grid-column: span 2;
  background: linear-gradient(135deg, #223D73 0%, #384C73 100%);
  color: #FFFFFF;
}
```

---

## 3. Anti-Patterns & Strict Prohibitions

1. 🚫 **NO Green Section Backgrounds:** Green (`#80BF41` or `#B7D996`) must NEVER be used as a section wrapper or container background color.
2. 🚫 **NO Exaggerated Numbering:** Do NOT place giant `01`, `02`, `03` numbers in project categories, knowledge areas, or feature lists.
3. 🚫 **NO Text-based Sponsor Logos:** Sponsor branding MUST render clean, vector-accurate SVG logos with `fill: currentColor` or original vectors. Never use plain text `<span>` tags as logo fallbacks.
4. 🚫 **NO Uniform Identical Grids:** Avoid grid layouts where every single card has identical dimensions and weights. Use asymmetric Bento layout ratios (e.g. 2:1 featured card, staggered heights, or hero feature blocks).
5. 🚫 **NO Educational Cliches:** Banned elements: cliparts, cartoon atoms, graduation caps, generic lightbulbs, floating purple AI meshes.
6. 🚫 **NO Emoji-as-Icons:** Use Phosphor, Lucide, or custom clean SVG icons.

---

## 4. Pre-Delivery Audit Checklist

- [x] **Design Read** stated upfront.
- [x] **Hero Cinematic "Fusão Energética":** Dark (`#0A0E1A`) backdrop with luminous aura.
- [x] **Theme Transition:** Seamless dark hero to `#F2F2F2` light body transition.
- [x] **Color Discipline:** Institutional Blue (`#223D73`, `#384C73`) + Green Accents (`#80BF41`, `#B7D996`) + Light Neutral (`#F2F2F2`).
- [x] **Green Scope:** Accent-only (buttons, active pills, badges, borders).
- [x] **Grids:** Asymmetric Bento Grid structures.
- [x] **Sponsor Logos:** SVG vector logos only.
- [x] **Typography:** Exo headers + Inter body.
- [x] **Anti-Cliché:** No 01/02 numbering, no graduation caps, no cartoon lightbulbs/atoms.
