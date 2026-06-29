# Handoff: Pacific Elite Rides — Step-by-Step Booking Wizard

## Overview
This redesigns the existing single-page booking form (`original-booking.html`) into a **guided multi-step wizard**: one logical group of questions per screen, a progress bar, auto-advance on choice steps, inline validation, an **editable review summary** at the end, and a success screen. The luxury dark/gold visual language of the current site is preserved exactly. Bilingual EN/ES is retained.

The goal is the same conversion (lead → booking request) but with far less cognitive load per screen and a higher completion rate.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype of the intended look and behavior, **not production code to copy verbatim**:

- **`Booking Wizard.dc.html`** — the interactive prototype. It runs on a small React-based runtime (`support.js`) used only for prototyping. **Do not ship this runtime.** Read it to understand exact state logic, step flow, validation, and styling. The markup is between `<x-dc>…</x-dc>`; the logic is the `class Component extends DCLogic { … }` block (look at `renderVals()` and the methods).
- **`original-booking.html`** — your current production page (vanilla HTML/CSS/JS, classes from `css/style.css`, logic in `js/main.js`, integrations: EmailJS, Square, Google Places).

**Your task:** recreate this wizard **inside the existing vanilla-JS codebase**, reusing the established CSS classes (`.form-ctrl`, `.form-label`, `.form-section-title`, `.btn`, `.sidebar-card`, etc.) and keeping the existing EmailJS / Square / Google Places integrations from `js/main.js`. The site is plain HTML/CSS/JS — **do not introduce React or a build step.** The prototype's inline styles are just there because the prototype can't use your stylesheet; map them back onto your existing classes (the values below tell you exactly what each one is).

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions. Recreate pixel-faithfully using the site's existing design tokens — they already match (the prototype's gold `#c9a44a`, Playfair Display + Inter, dark panels are the same system as `css/style.css`).

## Step Flow (6 steps + success)

| # | Step | Fields | Advance rule |
|---|------|--------|--------------|
| 0 | **Service** | Service Type (6 selectable cards) | Auto-advances ~170ms after a card is picked (configurable) |
| 1 | **Trip** | Date*, Pickup Time*, Passengers, Vehicle Preference, Flight Number | "Continue" button (validates date + time) |
| 2 | **Route** | Pickup Address*, optional Stops (add/remove), Drop-off Address* | "Continue" (validates pickup + dropoff) |
| 3 | **Contact** | Full Name*, Phone*, Email*, Special Requests | "Continue" (validates name, phone, email format) |
| 4 | **Payment** | Pay Later / Pay Now (2 cards); Pay Now reveals card-field slot | "Continue" |
| 5 | **Review** | Read-only summary of all answers, each group has an **Edit** link that jumps back to its step; plus pricing + trust info (the old sidebar, surfaced here) | "Send Booking Request →" → fires existing EmailJS/Square submit |
| — | **Success** | Confirmation message + "Book another ride" (resets to step 0) | — |

`*` = required.

### Field → existing-form mapping
Reuse the exact IDs/values from `original-booking.html` so `js/main.js` submission keeps working unchanged:
`serviceType`, `vehicle`, `rideDate`, `rideTime`, `passengers`, `flight`, `pickup`, stops list, `dropoff`, `clientName`, `clientPhone`, `clientEmail`, `notes`, payment method (`later`/`now`). The select option values and bilingual `data-en`/`data-es` labels are already in the original file — keep them.

## Interactions & Behavior

- **Progress bar** (top of card): fill width = `(step + 1) / 6 * 100%`. Caption: `Step {n} of 6 · {StepName}`. Transition: `width .45s cubic-bezier(.4,0,.2,1)`.
- **Auto-advance:** on the Service step, selecting a card sets the value and advances after `170ms`. Make this a flag (`autoAdvance`, default on) — when off, show a Continue button on step 0 too.
- **Step entrance animation:** `transform: translateY(14px) → 0` over `.4s ease` (a "slide up"). **Do not animate opacity to 0** — keep content visible at rest (resting state must be fully opaque; only transform animates). Offer a `fade` variant and a `none` variant if desired.
- **Validation** runs on "Continue" for the current step only; on "Send" it re-checks steps 1–3 and jumps to the first invalid step. Invalid field → red border `#d46a5a` + `box-shadow:0 0 0 3px rgba(212,106,90,.13)` and a helper line below in `#e08a7c` ("Required" / "Enter a valid email" — ES: "Requerido" / "Correo inválido").
- **Email rule:** `/^[^@\s]+@[^@\s]+\.[^@\s]+$/`.
- **Stops:** "Add stop" appends a stop input (dashed-border add button); each stop has a "×" remove button. Stops sit between Pickup and Drop-off, both visually and in the route summary.
- **Address fields** carry a decorative dot at `left:14px` (pickup = ring/outline, stop = filled-muted, dropoff = solid gold), so those inputs need **`padding-left:34px`** to clear it.
- **EN/ES toggle** (top-right): swaps all copy. The active button is filled gold (`#1a1408` text), inactive is outlined.
- **Edit links** on the review step call "go to step N" without clearing data.
- **Back button** appears on every step after step 0; never clears entered data.

## State Management
Single state object (mirror the prototype):
```
lang ('en'|'es'), step (0–5), submitted (bool),
serviceType, vehicle (default 'Any'), date (default today ISO), time, passengers (default '1'), flight,
pickup, stops (array of strings), dropoff,
name, phone, email, notes,
pay ('later'|'now'), errors ({field: 'req'|'email'})
```
Transitions: `pickService` (set + auto-advance), `next` (validate→step+1), `back`, `goToStep(n)` (edit links), `addStop`/`updateStop(i)`/`removeStop(i)`, `selectPay`, `submit` (validate all → set submitted → call existing send), `resetAll`. In vanilla JS this is one module-level object + a `render(step)` that shows/hides step `<section>`s and repaints the progress bar; reuse `js/main.js` for the actual send.

## Design Tokens (exact)

**Color**
- Gold accent `--gold`: `#c9a44a`
- Gold line (borders) `--gold-line`: `rgba(201,164,74,0.20)`
- Gold faint (selected fill / focus ring) `--gold-faint`: `rgba(201,164,74,0.09)`
- Gold glow (button shadow) `--gold-glow`: `rgba(201,164,74,0.28)`
- Page bg: `radial-gradient(120% 80% at 50% -10%, #1a160c 0%, #0b0a08 52%)`
- Card bg: `#131210`
- Text: `#f3efe6`; muted: `rgba(243,239,230,.55)` / `.5` / `.45`; placeholder `rgba(243,239,230,.30)`
- Error border `#d46a5a`; error text `#e08a7c`

**Typography**
- Display/headings: **Playfair Display** (600; 700 for logo; italic 400/500). Step titles: 29px / 600 / line-height 1.16. Card titles: 17.5–18px / 600.
- UI/body: **Inter** (300/400/500/600). Inputs 16px. Labels 10.5px / 600 / `letter-spacing:.14em` / uppercase. Captions 11–13.5px.

**Shape / spacing**
- Card: radius `18px`, border `1px var(--gold-line)`, shadow `0 34px 90px rgba(0,0,0,.55)`, padding `34px 38px` (header) / `30px 38px 36px` (body).
- Inputs: radius `9px`, padding `14px 15px` (address fields `padding-left:34px`), border `1px var(--gold-line)`. Focus: border `var(--gold)` + `box-shadow:0 0 0 3px var(--gold-faint)`.
- Selectable cards (service/payment): radius `11px`, padding `16–18px`, bg `rgba(255,255,255,.02)`; **selected** → bg `var(--gold-faint)`, border `var(--gold)`, gold ✓ in corner.
- Primary button: bg `var(--gold)`, text `#1a1408`, radius `10px`, padding `15px 28px`, 15px/600, shadow `0 10px 28px var(--gold-glow)`, hover `filter:brightness(1.06)`.
- Back button: transparent, border `1px var(--gold-line)`, radius `10px`, text `rgba(243,239,230,.8)`.
- Progress track: height `4px`, radius `3px`, bg `rgba(255,255,255,.06)`; fill `linear-gradient(90deg,var(--gold),var(--gold))`.
- Max content width: `720px`; page padding `28px 18px 60px`.

## Copy
All strings (EN + ES) are in the `DICT` object inside `Booking Wizard.dc.html` — service names/descriptions, step titles & subtitles, labels, placeholders, payment copy, review group titles, pricing rows, trust items, success message, and error strings. Lift them directly; they already match the brand voice and the original page's translations.

## Assets
- Fonts via Google Fonts (already linked in the original): `Playfair Display` + `Inter`.
- Fleet images on the original sidebar (`img-escalade.png`, `img-sprinter.png`) are optional on the wizard — currently not shown in the step flow. Add to the review step if desired.
- No new icons; selection ticks are the `✓` glyph, address dots are CSS circles.

## Files
- `Booking Wizard.dc.html` — interactive prototype (reference for logic + exact styles).
- `original-booking.html` — current production page (reference for existing classes, field IDs, and integration hooks in `js/main.js`).

## Suggested implementation approach (vanilla JS)
1. In `booking.html`, wrap each logical group of existing fields in a `<section class="wizard-step" data-step="N">`; keep all current field IDs.
2. Add a progress bar + step caption above the form; add a nav row (Back / Continue) below; convert Service Type and Payment into card grids.
3. In `js/main.js`, add the state object + `goToStep/next/back/validateStep` and a `render()` that toggles `.wizard-step` visibility and updates the bar. Wire auto-advance on service cards.
4. Build the review step by reading current field values into summary rows with Edit→`goToStep`.
5. Keep the existing submit handler (EmailJS/Square) — just call it from the final "Send" instead of a single submit button, and gate it behind full validation.
