# Exchange Rate — product specification

Status: draft for the product owner. This describes the **intended** product. It is not a description of working behavior.

Repo: [zealotjin/exchange-rate](https://github.com/zealotjin/exchange-rate) (`main`).

Working title is the repo name, **Exchange Rate**. The package, page title, and deployed site identity are still **Atlas Board**. Naming is an open question (see below).

## Product vision

A small foreign-exchange helper for people who are **not Korean** and need to think in **KRW** while engaging with Korea: a trip, a stay, or a purchase tied to Korean everyday life and culture.

The product answers three questions in plain language:

1. What is 1 unit of my money worth in won right now?
2. What does this won price cost me?
3. What do ordinary Korean prices feel like in my currency?

It is an **indicative converter with context**, not a bank, broker, card network, or remittance service. Rates are mid-market references. A card, airport counter, or money changer will not match them.

The K-culture angle is practical, not decorative: show money moments a foreigner actually hits (transit card, convenience-store meal, noraebang, a concert ticket, a market snack) so the rate is usable.

## Target users

Primary: English-reading foreigners dealing with KRW.

| Slice | What they need | Assumption |
| --- | --- | --- |
| Short-stay visitors | Quick conversion before and during a trip; phone-first | v0 priority |
| K-culture spenders | Ticket, merch, beauty, food, and cafe prices in home currency | v0 uses static examples, not live catalogs |
| Longer-stay students and workers | A remembered home currency and rough daily budget | v1, still not a banking app |

Out of the initial audience: FX traders, Korean residents managing domestic finance, and anyone who needs to **send or receive** money.

Assumption: v0 copy is English. Korean UI is later, if ever.

## Goals

- Publish one trustworthy KRW cross rate against a short list of home currencies.
- Convert amounts both ways (home → KRW and KRW → home).
- Show when the rate was fetched, who published it, and that it can be stale.
- State clearly that the figure is not a quote for cash, cards, or wires.
- Attach a few everyday Korea price anchors so the number means something.
- Work without an account.
- Keep any provider key on the server.

## Non-goals

- Moving money, holding balances, or quoting remittance, card, or airport spreads.
- Trading tools: tick charts, order books, alerts, multi-leg crosses, historical backtests.
- Tax, visa, banking, or “how to open an account in Korea” advice.
- Live prices for tickets, merch, or shops.
- Replacing the Atlas Board demo in the docs-only change. The UI stays until a later implementation change.
- Accounts as a requirement for conversion.

## Current status vs intended product

The tree is a **vinext starter plus an Atlas Board demo**. There is no FX conversion, rate client, currency formatting, or product copy.

| Area | In the repo today | Intended product |
| --- | --- | --- |
| Package name | `atlas-board` (`package.json`) | Undecided; repo is `exchange-rate` |
| Home page | `app/page.tsx`: client-side placement map. Item types are pin, task, asset, alert. Positions persist in `localStorage` under `atlas-board-items`. | KRW converter and context |
| Metadata | `app/layout.tsx` title “Atlas Board”. `metadataBase` is `https://atlas-board-map.jazzy-fawn-1358.chatgpt.site`. | Product name and site URL TBD |
| Root README | Generic vinext-starter text. A stray `# exchange-rate` heading sits at the end. | Can point at `doc/` later; not rewritten here |
| Database | `db/schema.ts` is empty (`export {}`). `drizzle/meta/_journal.json` has no migrations. | No tables required for v0 |
| D1 example | `examples/d1/` is an opt-in notes CRUD sample. It is not mounted by the app. | Reference only, until prefs need a database |
| Bindings | `.openai/hosting.json` sets `"d1": null` and `"r2": null`. `db/index.ts` throws unless a `DB` binding exists. | Leave unbound until v1 persistence |
| Auth | `app/chatgpt-auth.ts` has SIWC helpers. The home page does not call them. | Optional later; v0 stays anonymous |
| Tests | `tests/rendered-html.test.mjs` asserts Atlas Board title and copy after `vinext build`. | Will need new assertions when the page changes |
| Rate APIs / secrets | None. `.env*` is gitignored. | Server-only placeholders; see below |

Commands that exist: `npm run dev`, `npm run build`, `npm test`, `npm run lint`, `npm run db:generate`. Node `>=22.13.0`. The starter does not use `wrangler.jsonc`.

## Core features

Assumptions are marked **(A)**. Anything not marked is a proposed requirement for the owner to confirm.

### v0 — public KRW helper

One mobile-first page. No login. No database. Atlas Board is removed or replaced only in the implementation PR, not this one.

- **(A)** Home currencies: USD, EUR, JPY, CNY, GBP, TWD, AUD. Default USD. User picks; do not infer from IP.
- Base currency is always KRW. Show both “won per 1 home unit” and “home units per ₩1,000” (KRW-per-one is a huge or tiny number depending on the pair; per-1,000 is easier to read for USD/EUR/GBP).
- Amount field with an explicit direction toggle: home → KRW and KRW → home.
- Format KRW as won with **no decimal places** (everyday prices ignore jeon). Format the home currency with that currency’s usual minor units (JPY and KRW: 0; USD, EUR, GBP, AUD, CNY, TWD: 2). **(A)** on the minor-unit list.
- Show: numeric rate, provider name, fetched-at time in the user’s local zone plus UTC, and a stale state if the cache is older than the TTL.
- Disclaimer, visible without opening a dialog: indicative mid-market rate; not a cash, card, or wire quote; not financial advice.
- **(A)** Four to six static anchors, each a labeled range in KRW, converted with the current rate. Proposed set:
  - Convenience-store meal
  - Subway or bus ride (single ride, not a T-money card price)
  - Iced coffee
  - Noraebang room, short session, per person order of magnitude
  - Palace or hanbok-rental style outing (one illustrative figure)
  - Concert or fan-event ticket, lower and upper example
- Each anchor is copy, not a feed. Label it as an illustration with an approximate KRW range, not a live price.
- Server route fetches the rate and caches it. The browser never sees the provider key.
- If the provider is down, show the last cached rate with a stale banner, or a clear error if nothing has ever been cached. Do not invent a rate.

### v1 — remembered context

Still no money movement.

- Remember home currency (and optionally the last amount) in `localStorage`.
- **(A)** A tiny trip sketch: number of days × a chosen daily cash figure in KRW, shown in the home currency. Inputs stay on device.
- Short “why this number” lines on the anchors (what a foreigner should expect), still static.
- Optional Sign in with ChatGPT **only** if cross-device preferences are required. Conversion itself stays usable while signed out. Helpers already live in `app/chatgpt-auth.ts`. Protected pages must set `dynamic = "force-dynamic"`. Do not add routes for `/signin-with-chatgpt`, `/signout-with-chatgpt`, or `/callback`.
- D1 only if those preferences must live on the server. Turn on the `DB` binding in `.openai/hosting.json` and add real tables in `db/schema.ts` at that point. Do not reuse the notes example as the product schema.

### Not in v0 or v1

Historical charts, rate alerts, fee comparison across cards, Korean-language UI, user-submitted prices, sharing links with server storage, and any payment or KYC flow.

## Tech stack and hosting

These match the repo as it exists. They are assumptions about **where the product will be built**, not a claim that hosting is already configured for FX.

- TypeScript, React 19, Tailwind 4, Vite 8.
- [vinext](https://github.com/cloudflare/vinext) `1.0.0-beta.2` on Cloudflare Sites. App routes live under `app/`. Worker entry is `worker/index.ts` (image optimization plus the vinext app-router handler).
- Local bindings are simulated in `vite.config.ts` from `.openai/hosting.json`. Placeholder D1 id `00000000-0000-4000-8000-000000000000` is a starter constant, not a database.
- Optional persistence: Drizzle ORM + Cloudflare D1 (SQLite dialect in `drizzle.config.ts`). Migrations generate into `drizzle/` and are copied to `dist/.openai` by `build/sites-vite-plugin.ts`.
- Optional identity: ChatGPT SIWC headers (`oai-authenticated-user-id`, email, optional percent-encoded full name). SIWC is identity only, not workspace membership.
- **(A)** v0 rate fetch runs in a server route or the Worker, with an in-memory or Cache API TTL. No R2. No D1.
- **(A)** Hosting stays on the existing Cloudflare Sites / ChatGPT site path. The Atlas Board `metadataBase` host is leftover starter identity and should change when the product UI ships.

`npm test` currently builds the site and checks Atlas Board HTML. An implementation change has to update that test in the same PR as the page.

## Data sources and secrets

No provider is selected. No keys belong in git. `.gitignore` already ignores `.env*`.

**(A)** v0 uses one mid-market HTTP provider, server-side only. Candidates to choose among (not integrated):

- A no-key public feed that actually publishes KRW (confirm coverage before relying on it; ECB-based feeds often include KRW on business days).
- A keyed commercial FX API.
- Bank of Korea ECOS, if the owner wants the official KRW reference. That path needs a key, Korean-language docs, and business-day semantics.

Do not blend providers in v0.

Placeholders for a local `.env.local` (do not commit; values below are fake):

```bash
FX_PROVIDER=unset
FX_API_BASE_URL=https://example.invalid/fx
FX_API_KEY=
FX_CACHE_TTL_SECONDS=3600
```

| Name | Required | Notes |
| --- | --- | --- |
| `FX_PROVIDER` | yes, once a provider is chosen | Short label stored with the cached quote and shown in the UI |
| `FX_API_BASE_URL` | yes | Server-only base URL |
| `FX_API_KEY` | only if that provider requires one | Empty for a keyless feed. Never send to the client, never log it |
| `FX_CACHE_TTL_SECONDS` | no | Default 3600 if unset. KRW reference rates are not tick data |

D1 and R2 stay unset until a later spec says otherwise. There is no `wrangler.jsonc` secret binding in this repo.

## Open questions

1. Product name. Keep “Exchange Rate”, pick a public name, or keep Atlas Board for something else?
2. Which user slice is first: tourists, K-culture shoppers, or longer-stay residents? The anchors change with that answer.
3. Is the v0 currency list (USD, EUR, JPY, CNY, GBP, TWD, AUD) right? Add THB, VND, CAD, SGD, PHP?
4. Which rate source is acceptable: convenient mid-market, or Bank of Korea official, even if it lags and needs a key?
5. Is “indicative only” the lasting product boundary, or should a later version compare card and cash spreads?
6. English only for v0, or English and Korean together?
7. Are the static price anchors enough of a K-culture angle, or is editorial content required before launch?
8. Should Sign in with ChatGPT exist in v1, or stay unused?
9. When implementation starts, replace `app/page.tsx` in place, or leave Atlas Board on a side route until the converter is ready?
10. Any monetization (ads, affiliate booking, data licensing)? None is assumed.
11. Disclaimer and jurisdiction: who reviews the “not a quote / not advice” line before public launch?
12. Replace the Atlas Board `metadataBase` host as part of the first UI PR?

## Assumption log

| ID | Assumption | If wrong |
| --- | --- | --- |
| A1 | v0 is anonymous, English, one page, no D1 | Add auth, i18n, or schema before building UI |
| A2 | Home set is USD, EUR, JPY, CNY, GBP, TWD, AUD; default USD | Change the picker only |
| A3 | KRW displays with 0 fraction digits; JPY too | Confirm TWD (often shown with 0 or 2) |
| A4 | Anchors are static KRW ranges, not live prices | Need a content or data source before v0 |
| A5 | One server-side FX provider; 1-hour cache | Pick the provider and TTL in the implementation PR |
| A6 | No money movement, ever, unless a future spec says so | Stops being a simple Sites app |
| A7 | Build on the current vinext / Cloudflare Sites stack | Do not introduce a second framework for v0 |
