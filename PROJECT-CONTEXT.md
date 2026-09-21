# Pacific Elite Rides — context for a new Claude session

**Read this file first, before touching anything.** It is the fastest way to pick up where the
previous session left off. Last updated: 2026-09-21.

---

# 1. What this project is

Pacific Elite Rides LLC — premium black car / chauffeur service in San Diego County, California.
Owner: **Andrii Berdnikov**, phone (619) 394-5340, email berdnikov@pacificeliterides.com.

The deliverable is a **static marketing website** — `pacificeliterides.com` — that converts search
traffic and paid ads into direct bookings, so the business depends less on Uber Black and Lyft Lux.

- Plain HTML / CSS / vanilla JS. **No build step, no framework, no package manager.** You edit the
  `.html` files directly and that is the whole deploy pipeline.
- Hosted on **GitHub Pages** from repo `berdnikovandrii/pacific-elite-rides`, custom domain via
  Squarespace DNS (A records to GitHub, `CNAME` file in the repo root).
- Bilingual **EN / ES** everywhere. Every user-visible string exists twice, as
  `<span class="lang-en">…</span><span class="lang-es">…</span>`. `js/main.js` toggles them.

**Strategic context that changes how you should weigh decisions:** Andrii is building a documented
operating history for an **E-2 visa** application, horizon 18–24 months. Published rates, real
invoices, business memberships and a clean paper trail are worth more to him than a shortcut that
looks good this week.

---

# 2. Ground rules

These are learned the hard way. Violating them costs real money or real time.

**Git — he pushes, not you.** The sandbox cannot reach GitHub (403 through the proxy) and
`.git/HEAD.lock` / `.git/index.lock` appear constantly. Commit locally if you can, then always end
your reply with the exact commands for him:

```bash
cd ~/Documents/Claude/Projects/New\ beginning\ -\ Transport\ LLC
rm -f .git/HEAD.lock .git/index.lock
git add -A && git commit -m "…" && git push
```

**Never stage these:**
- `Pacific_Elite_Rides_Earnings.xlsx` — his revenue data. It lives in the repo root but is
  gitignored on purpose (it was once public; we removed it).
- `photos/` — 840 MB of camera originals. Only the optimised `web-photos/` copies are committed.

**Edit the earnings spreadsheet in place.** Never copy it to the outputs folder and back — that
wipes his manual formatting, including the paid-cell colouring he relies on.

**Never ask him for secrets.** API keys, Twilio Auth Tokens, passwords — hand him code with
placeholders and let him paste his own values. This is a hard rule, not a preference.

**The sandbox filesystem is flaky.** `Resource deadlock avoided` and `Operation not permitted` on
the mounted folder are routine. Retry after `sleep 3`, or use the Read/Write/Edit tools instead of
shell commands — those are more reliable on that mount.

---

# 3. How we make changes — the standard loop

1. **Clarify only what is genuinely ambiguous**, and only when the answer changes the work. A price
   with two possible readings: ask. A wording choice: just pick the better one and say why.
2. **Make a task list** for anything with three or more steps. He watches progress there.
3. **Find every occurrence before editing one.** Grep the whole site. The most common failure mode
   in this project is changing a price in two files and missing the other eight.
4. **Edit.** Prefer the Edit tool for surgical changes; a Python script when the same change hits
   many files, so the transformation is reviewable and repeatable.
5. **Verify — always, not just when it feels risky.** See §4.
6. **Update memory** if pricing, structure, or a workflow changed.
7. **Hand him the git commands.** Summarise what changed in a few lines, not a wall of text.

## The price-change checklist

Prices are the single most-edited thing here and they live in **ten** places. When one rate moves,
walk this list or something will contradict something else:

- [ ] `index.html` — main rate table in the Airport service card
- [ ] `index.html` — mini rate table inside the Pricing card
- [ ] `index.html` — footer "Popular Routes" links
- [ ] `index.html` — pricing FAQ answer (EN **and** ES)
- [ ] `airport.html` — rate table + `<title>` + meta description + JSON-LD `price`
- [ ] `san-airport-car-service.html` — rate table + FAQ answer + **every** JSON-LD `Offer`
- [ ] the matching route page (`san-airport-to-*.html`) — hero figure, route facts, FAQ, CTA
- [ ] `san-diego-to-lax.html` / `lax.html` if the LAX rate moved
- [ ] `services.html` — service-detail price block + FAQ + FAQPage schema
- [ ] `booking.html` — sidebar rate list, service-card descriptions (EN + ES), **and the
      `ZONES` array in the fare estimator**
- [ ] `blog/*.html` — prose mentions. **Careful:** some `$60–90` figures are *rideshare comparison
      numbers*, not our prices. Protect them with a placeholder token before a blanket replace.

Afterwards grep the old number across the whole site to confirm nothing survived.

---

# 4. How to verify

Do this before you tell him it is done.

**JSON-LD** — every page carrying schema must still parse:
```python
import json, re, glob
for f in glob.glob('*.html') + glob.glob('blog/*.html'):
    if 'design_handoff' in f: continue
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', open(f).read(), re.S):
        json.loads(m.group(1))
```

**Tag balance** — after any structural edit: `s.count('<div') == s.count('</div')`, same for
`<section>`.

**Sitemap** — `xml.dom.minidom.parse('sitemap.xml')`.

**The booking wizard** — it has a real state machine, so test it rather than eyeballing it. Extract
the inline `<script>` into a file, stub `document` / `localStorage` / `emailjs`, then drive
`validateStep`, `next`, `back`, `estimateFare` directly in Node. Two genuine bugs were caught this
way that a visual check would have missed: the `$65` minimum silently overriding the published `$60`
Downtown rate, and `state.outOfArea` being undefined because it was added to `resetAll` but not to
the initial state.

**Ads pages must stay out of the index.** `airport.html` and `lax.html` carry `noindex,follow` plus
a canonical pointing at their SEO twin, and are deliberately absent from `sitemap.xml`. If a change
ever puts them back in, that is keyword cannibalisation — precisely the weakness we documented in a
competitor.

---

# 5. Current pricing — supersedes anything older you find anywhere

| SAN zone | Flat rate |
|---|---|
| Downtown / Gaslamp | $60 |
| Coronado | $80 |
| La Jolla / UTC | $90 |
| Del Mar | $95 |
| Carlsbad / Encinitas / Solana Beach | $115 |
| Oceanside / Vista / San Marcos | $130 |
| Ramona / Fallbrook | $150 |
| Temecula / Murrieta / Wildomar | $195 |
| Riverside / Corona | $250 |
| San Diego ↔ LAX | $375 |

**Minimum fare $65** — a floor for *custom* quotes only. It must never override a published zone
rate; that bug has already been introduced and fixed once.

Hourly charter **$95/hr, 2 h minimum** · Sprinter Party Bus **$180/hr, 4 h minimum** (LED lighting,
premium sound, TV, bar with ice, up to 14 passengers) · Mercedes-Maybach S-Class **$280/hr, 3 h
minimum** (white leather, reclining seats, weddings and VIP) · Special events: custom quote.

**No limousine.** That service was removed from the site — do not reintroduce it.

**LAX is a route, not a service area.** Every ride starts or ends in San Diego County. Copy must
never imply the company operates locally in Los Angeles; the site says so explicitly in several
places, and the ad targeting depends on it.

---

# 6. Site map

| Purpose | File |
|---|---|
| Home | `index.html` |
| Services — airport, LAX, corporate, party bus, Maybach, events | `services.html` |
| SAN airport hub — **SEO, indexed** | `san-airport-car-service.html` |
| SAN airport — **paid ads only**, noindex + canonical → hub | `airport.html` |
| San Diego ↔ LAX — **SEO, indexed** | `san-diego-to-lax.html` |
| San Diego ↔ LAX — **paid ads only**, noindex + canonical → SEO | `lax.html` |
| Route pages | `san-airport-to-downtown.html`, `-coronado`, `-la-jolla`, `-del-mar`, `-temecula` |
| Party bus guide | `sprinter-van-san-diego.html` |
| Booking wizard | `booking.html` |
| Ads conversion page, noindex | `thank-you.html` |
| Blog | `blog.html` + `blog/` |
| About / Privacy / Terms | `about.html`, `privacy.html`, `terms.html` |
| Styles — single file, everything | `css/style.css` |
| Menu, language toggle, reveal animations | `js/main.js` |
| Apps Script reference copy | `google-apps-script.js` |

---

# 7. The booking form

Three steps: **(1)** Service + Date + Time + Passengers, with Vehicle and Flight Number collapsed
under a "More options" `<details>`; **(2)** Pickup / Drop-off with optional stops; **(3)** Name +
Phone + Email → Send. There is no Payment step and no Review step — they were removed to cut
abandonment. Submitting redirects to `thank-you.html` so Google Ads has a unique conversion URL.

Step 2 shows a **live zone-based fare estimate** — "Estimated flat rate $XXX · All-inclusive · SUV
up to 6 · no surge" — falling back to "Custom quote, confirmed within 15 min" when neither endpoint
is SAN/LAX or the zone is unrecognised. The zone table is the `ZONES` array inside `estimateFare()`;
it matches on city names and ZIP codes in the address string Places returns.

Places autocomplete is hard-limited to **Southern California** (bounds 32.5–34.8 lat, −118.7 to
−116.0 lng, `strictBounds`, `country: 'us'`). Because a user can still paste an address, the real
guard is a coordinate check in `place_changed`: an out-of-area address shows
**"We serve Southern California only"** and blocks submission until it is replaced.

---

# 8. Integrations, and what breaks them

**Google Sheets CRM** — an Apps Script `doPost` webhook appends each booking to the Bookings sheet.
Three things matter: it is a **bound** script and must use `SpreadsheetApp.getActiveSpreadsheet()`
rather than `openById()`; the site must POST with `mode: 'no-cors'` and
`Content-Type: text/plain`, because `application/json` triggers a CORS preflight that Apps Script
rejects; and **after any edit you must Deploy → Manage deployments → Edit → New version → Deploy**,
otherwise the live webhook keeps running the old code. Column P has a colour-coded status dropdown:
New / Confirmed / Waiting on answer / No answer / Refused.

**EmailJS** — service `formsender`, template `template_3g6ev1c`, public key `iOE_629EUQLFOEy-S`.
The private key is server-side only and must never appear in frontend code.

**Google Places** — powers both the live review widget on the homepage and the booking autocomplete.
GBP listing is "Pacific Elite Rides LLC", Place ID `ChIJE0qtZLk4QSARFMPubxQjFBs` (hardcoded, because
the listing is too new to be found by text search through the API).

**Analytics** — GA4 `G-MRH0C5ZBF1` on every page. The Google Ads line
`gtag('config', 'AW-XXXXXXXXX')` is commented out, waiting for a real Ads ID.

**SMS lead alerts — removed 2026-09-21. Do not rebuild this without him asking.** Three approaches
were tried and all failed: carrier email-to-SMS (`@tmomail.net`) returned
`452 4.1.0 server temporarily unavailable AUP#MXRT` and bounced for days; ntfy.sh is unreachable
from Google's egress; Twilio needs A2P 10DLC registration that was never finished. The gateway
block is gone from `google-apps-script.js`. **Lead notification now runs on email only** — EmailJS
fires from the booking form, and the row lands in the sheet. If he raises SMS again, Twilio is the
only path that actually works, and it needs the A2P registration finished first.

**Scheduled task `gbp-weekly-content`** — runs every Monday, writes a full blog article into
`blog/`, adds the index card and sitemap entry, and drafts two Google Business Profile posts that
link to it. The direction is deliberate: **article on the site first, GBP post links back to it** —
never the reverse, because SEO equity should accumulate on his domain, not inside Google's profile.

---

# 9. Market position

Two direct competitors, and neither is strong where Andrii is:

**Pompeii Limousine** — weddings, downtown, Rolls-Royce positioning. One vehicle in FMCSA records;
everything else is farmed out. Messy SEO (duplicate domain, ~70 doorway pages) but posts to Google
Business Profile every 1–3 days, which is what actually keeps them in the local map pack.

**Richline Transportation** — corporate, airport, North County. Two or three real vehicles. Clean
route-page SEO, near-daily blog, collects reviews about twice as fast as Pompeii.

**Neither publishes prices.** The published rate card is Andrii's fastest wedge. Neither offers
corporate direct billing, a Certificate of Insurance, or a duty-of-care package — which is the first
thing hotels and corporate accounts ask about.

---

# 10. Open items

- **Google Ads ID** → uncomment the `AW-` line site-wide and wire the conversion event on
  `thank-you.html`.
- **NLA membership** — $395/yr for the 1–5 vehicle tier, which includes the NLARide.com listing
  (the $99 single-vehicle tier does not, and that listing is half the value).
- **BBB** — free profile now; paid accreditation once there are 10+ Google reviews, so it does not
  look empty.
- **Google Search Console** — resubmit `sitemap.xml` after each batch of new pages.
