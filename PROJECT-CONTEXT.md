# Pacific Elite Rides — context for a new Claude session

**Read this first.** It is the fastest way to pick up where the last session left off.
Last updated: 2026-09-16.

---

## The business

Pacific Elite Rides LLC — premium black car / chauffeur service, San Diego County, California.
Owner: Andrii Berdnikov. Phone (619) 394-5340. Site: **pacificeliterides.com** (static HTML on
GitHub Pages, repo `berdnikovandrii/pacific-elite-rides`, custom domain via Squarespace DNS).

Strategic goal: documented operating history for an **E-2 visa** application (18–24 month horizon).
That is why paperwork, published rates and a real paper trail matter more than they would for a
normal small business.

## How Andrii works

- Speaks **Ukrainian**; everything customer-facing is **English** (site is bilingual EN/ES).
- Wants concise answers. No long preambles.
- **He pushes to git himself.** The sandbox cannot reach GitHub, and `.git/*.lock` files appear
  constantly. Always finish by giving him the exact terminal commands:
  ```
  cd ~/Documents/Claude/Projects/New\ beginning\ -\ Transport\ LLC
  rm -f .git/HEAD.lock .git/index.lock
  git add -A && git commit -m "..." && git push
  ```
- **Never `git add`** `Pacific_Elite_Rides_Earnings.xlsx` (his revenue data) or `photos/`
  (840 MB of originals). Both are deliberately gitignored.
- Edit `Pacific_Elite_Rides_Earnings.xlsx` **in place** in the project folder — never round-trip
  it through the outputs folder, that wipes his manual edits (paid-cell colouring).
- Verify work before declaring it done: validate JSON-LD, check tag balance, run the booking
  wizard's state machine in Node with a DOM stub (see the pattern in the git history).

## Current pricing — this supersedes anything older you find

| SAN zone | Flat |
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

Minimum fare **$65** — a floor for *custom* quotes only; it must never override a published zone rate.
Hourly charter **$95/hr, 2 h min** · Sprinter Party Bus **$180/hr, 4 h min** · Maybach S-Class
**$280/hr, 3 h min**. No limousine — that service was removed.

**LAX is a route, not a service area.** Every ride starts or ends in San Diego County. Do not let
copy imply the company operates locally in Los Angeles.

## Site map

| Purpose | Page |
|---|---|
| Home | `index.html` |
| Services (airport, LAX, corporate, party bus, Maybach, events) | `services.html` |
| SAN hub — **SEO** | `san-airport-car-service.html` |
| SAN — **paid ads only** (noindex + canonical → hub) | `airport.html` |
| LAX — **SEO** | `san-diego-to-lax.html` |
| LAX — **paid ads only** (noindex + canonical → SEO) | `lax.html` |
| Routes | `san-airport-to-downtown / -coronado / -la-jolla / -del-mar / -temecula.html` |
| Party bus guide | `sprinter-van-san-diego.html` |
| Booking wizard | `booking.html` |
| Ads conversion page (noindex) | `thank-you.html` |
| Blog | `blog.html` + `blog/` |

**The ads pages and their SEO twins must never both be indexed** — that is keyword cannibalisation,
the exact weakness we documented in a competitor. Ads pages stay out of `sitemap.xml`.

## Booking form

Three steps: (1) Service + Date + Time + Passengers, with Vehicle and Flight Number collapsed under
"More options"; (2) Pickup / Drop-off; (3) Name + Phone + Email → Send. No Payment or Review step.
Submit redirects to `thank-you.html` so Google Ads has a conversion URL.

Step 2 shows a live zone-based estimate. Places autocomplete is hard-limited to Southern California
(32.5–34.8 lat, −118.7 to −116.0 lng, `strictBounds`, US only); an out-of-area address blocks
submission with "We serve Southern California only".

## Integrations

- **Google Sheets CRM** — Apps Script webhook (`doPost`) appends each booking. Bound script; uses
  `SpreadsheetApp.getActiveSpreadsheet()`, *not* `openById`. Fetch from the site must use
  `mode: 'no-cors'` + `Content-Type: text/plain`, otherwise CORS preflight kills it.
  **After editing the script you must Deploy → Manage deployments → Edit → New version → Deploy**,
  or nothing changes. Status column P has a colour-coded dropdown (New / Confirmed / Waiting on
  answer / No answer / Refused).
- **EmailJS** — service `formsender`, template `template_3g6ev1c`, public key `iOE_629EUQLFOEy-S`.
  The private key is server-side only and must never appear in frontend code.
- **Google Places** — live reviews on the homepage, Place ID `ChIJE0qtZLk4QSARFMPubxQjFBs`
  (GBP listing "Pacific Elite Rides LLC"). Same key powers booking autocomplete.
- **GA4** `G-MRH0C5ZBF1` on every page. The Google Ads line `gtag('config','AW-XXXXXXXXX')` is
  commented out and waiting for a real Ads ID.
- **SMS lead alerts** — unresolved. Email-to-SMS gateways (`@tmomail.net`) accept the mail and
  silently drop it when sent from Apps Script servers; ntfy.sh is unreachable from Google's egress.
  Andrii chose Twilio and is mid-way through A2P 10DLC brand/campaign registration.
  **Do not ask him for the Twilio Auth Token** — give him the code with placeholders and let him
  paste his own credentials.
- **Scheduled task `gbp-weekly-content`** — every Monday writes a full blog article into `blog/`,
  adds the card and sitemap entry, and drafts two Google Business Profile posts that link to it.
  The content flow is deliberately **article on the site → GBP post links back**, never the reverse.

## Competitive position

Two local competitors: **Pompeii Limousine** (weddings / downtown, really one car, messy duplicated
SEO but posts to GBP every 1–3 days, which is what keeps them in the map pack) and **Richline
Transportation** (corporate / airport / North County, 2–3 cars, clean route-page SEO, near-daily blog).
**Neither publishes prices.** Andrii's published rate card is the fastest wedge, and neither offers
corporate direct billing, COI, or duty-of-care — which hotels and companies ask about first.

## Open items

- Twilio A2P registration → then paste credentials into the Apps Script and test the full chain.
- Google Ads ID → uncomment the `AW-` line and wire the conversion event on `thank-you.html`.
- NLA membership ($395/yr for the 1–5 vehicle tier, which includes the NLARide.com listing).
- BBB: free profile now, paid accreditation once there are 10+ Google reviews.
- Submit `sitemap.xml` in Google Search Console after each batch of new pages.
