# Exchange office finder

Short functional spec for a public, multilingual website that helps tourists find currency-exchange offices in Korea and compare the rates those offices publish.

This replaces the earlier assumption that the product was a generic KRW converter with static price examples. Source: an internal policy document, v0.1.0 (service and admin). This file is a summary, not the policy list. Phasing is intentionally not decided here. Sections are split so a later phase plan can cut along these boundaries.

## Current code

The repo does not implement this product. It is still a vinext starter:

- Package name `atlas-board`. Home page is a client-side placement map stored in `localStorage`.
- Root README is the generic starter.
- `db/schema.ts` is empty. D1 and R2 bindings are off. ChatGPT sign-in helpers exist and are unused.
- No offices, rates, currencies, accounts, or admin.

The policy document does not choose a framework or host. Nothing below is a claim that the starter stack already supports it.

## Product

A visitor picks a place in Korea, a currency, and how they will pay. The site lists exchange offices for that context and shows each office’s own posted rates. A calculator compares what the visitor would receive. The site does not exchange money, hold funds, or book a transaction.

Two kinds of people use it:

- Tourists and other non-resident visitors who need cash changed and want to compare offices.
- Staff: operators who maintain the catalog, and an office owner who maintains their own rates and listing.

Login is optional for visitors. Browsing, calculating, and saving offices in the browser work signed out.

## Out of scope

- Moving, holding, or quoting a binding price for money. No wallet, remittance, or checkout.
- A live market-rate feed. Rates are entered by operators or the office owner.
- A native app. Push settings and app-version screens are explicitly dropped. Rate-reached alerts (email or web push) are noted only as a later idea, not part of this spec.
- Trader tools: charts, order books, historical backtests.

## Capability map

Not a build order. Later phasing can select these blocks. The last column is a dependency, not a phase.

| Block | What it covers | Needs |
| --- | --- | --- |
| Reference data | Languages, areas, currencies, payment methods, disclosure text, image rules | — |
| Office catalog | Listings, photos, hours, location, public detail page | Reference data |
| Discovery | Destination, payment method, result list | Office catalog |
| Compare | Calculator and office ranking | Discovery, posted rates |
| Saves | Browser or account shortlist | Office catalog |
| Visitor reports | “This rate looks wrong” and listing corrections | Office catalog |
| Comments | Office reviews, reports, moderation | Accounts for writing |
| Content | Notices, exchange guide, FAQ, terms | Reference languages |
| Admin and owner tools | Catalog, rates, queues, accounts | The block they edit |

## Visitor features

### First visit

One-time layer: language, then location permission, then default currency. Choices live in the browser and can be changed in Settings. If the URL already has a language prefix, skip language selection.

Location: explain why before the browser prompt. If the visitor skips or denies it, continue with destination “not selected”. The location API needs HTTPS; that constraint is still an open check.

Default currency follows the chosen language (see Languages). Changing language later does not overwrite a currency the visitor already set.

### Find offices

Main screen.

- Menu opens a drawer (a fixed panel on wide screens).
- Destination: airport or city area, two levels (for example airport, then a specific airport). Choosing one filters the list.
- Exchange method: currency plus payment type (cash, card, pay). The list shows offices that support the selection.
- Each card shows the posted rate for the selected currency, the as-of time, photo, name, tags, and short description.
- A disclosure sits above the list. Copy is managed per language in admin and cannot be turned off.
- A card opens the office page.

The main screen is meant to surface a strong office for the chosen place. It does not define a numeric sort. Ranking rules that are defined live on the calculator.

### Office detail

Public URL `/{language}/store/{id}`. Missing translations fall back to English.

Shows a photo carousel (up to 10), public id, open or closed (from the weekly hours), distance when location is known, rates, payment methods, hours, Korean and English address, and a map link. Copying the address copies the Korean address. Unsupported payment methods are shown inactive.

The rate table puts the selected currency first. Each rate shows its as-of timestamp. Stale rates are labeled needs update. Rates with enough recent visitor reports are labeled under review.

Actions: save, share (system share, or copy the URL), calculate with this office’s rate locked, directions via a map link, report a wrong rate, request a listing fix, report the listing, and open comments. The latest comment is previewed.

### Compare and calculate

Uses the same destination and exchange method as the main screen. Enter an amount and see the result immediately. Flip direction: foreign currency to KRW, or KRW to foreign currency. The flip switches which of the office’s two posted rates is used.

Quick-amount chips are defined per currency in admin (four amounts). They replace the typed amount.

The headline result uses one rate:

- Default: the best office on the comparison list.
- Or a single office, including when the visitor arrived from that office’s Calculate action.

The list under the result ranks offices by amount received (default) or by distance. Each row shows area, distance, and as-of time. Needs-update offices stay in the list but sort after fresh ones and are labeled. A row opens the office. If none match, show an empty state.

The result is a reference amount from the as-of rates. Fees and preferential rates are not applied. Disclosure text is required here too. Exact legal wording is not signed off.

### Saved offices

Saved from the detail page. Signed out: stored in the browser, with a warning that clearing site data deletes them. Signed in: stored on the account. On login, browser saves merge into the account.

Sort by saved order (default), distance, or rate. Rates refresh when the page opens. Multi-delete in an edit mode. Unsave can be undone for a few seconds. A sign-in prompt appears only when there is at least one browser save.

### Rate reports

Anyone can report that a posted rate does not match what they saw, including signed-out visitors. Signed-in visitors can be emailed the outcome.

The form shows the office, the rate on screen, and its as-of time. The visitor enters the rate they saw (into KRW, into foreign currency, or both), when they saw it (today or yesterday only, default now), an optional note, and up to two photos. The time they saw it must be at or after the posted as-of time. The same number as the posted rate is rejected. Notes pass the banned-word list.

Limits: three reports per office per device or IP per day. Blocked IPs cannot submit. Within 24 hours, if reports for the same office and currency reach the configured count (default 3), the public rate table shows under review until the rate is corrected or the report is rejected.

### Comments

Public to read. Writing, editing, deleting, and reporting a comment require login.

A comment is text, up to three photos, or both. Sort newest or oldest. Optional photos-only filter. Twenty per page, then load more. A translate control shows the comment in the current language. Edits are marked edited.

Banned words block submission. A write-banned user sees the ban reason and dates and cannot post. A blocked IP cannot post. Visitors can report someone else’s comment once. At the configured report count (default 5) the comment is hidden pending staff review.

### Account and settings

Social login only, via web OAuth. No site password for visitors. Login returns to the previous page. First login asks for required consents once. The age check (14+) and the consent list still need legal review.

Which providers appear, and in what order, depends on language. The provider list itself is not fixed in this spec. WeChat on desktop is QR; inside WeChat’s browser it is direct. Simplified Chinese should prefer WeChat, because Google is often unreachable in mainland China. That preference is not signed off.

Settings: nickname, language, default currency, location-permission status, distance unit (km or miles; miles default for English with a US locale), terms, log out, and delete account. The site cannot flip a browser permission itself; if location is blocked, explain how to change it in the browser. Account deletion asks for an optional reason.

Nickname: letters, digits, and underscore, unique, banned-word checked, generated at signup and editable. Length limits are in the field rules below.

### Menu, guides, and contact

The drawer links to saved offices, the exchange guide, contact, settings, and a separate window for office-owner login. The guide is foreigner-facing caution content published in admin.

Contact channels are not fixed. The draft split is a LINE account for Japanese and Traditional Chinese, a WeChat account for Chinese, and email otherwise.

Footer and settings show terms and privacy in the selected language, with a note that the Korean original prevails, plus business identification (trade name, representative, registration number, contact). No values are specified here.

## Languages

Supported language path prefixes: `/ko`, `/en`, `/ja`, `/zh-cn`, `/zh-tw`. Language names are shown in their own language. The first visit pre-selects the browser language, or English if it is not supported.

Visitor-facing text, office copy, area names, currency names, disclosures, and articles are per language. Korean and English are required for office names, descriptions, and disclosure text. Any missing language falls back to English.

Draft default currency:

| Language | Default |
| --- | --- |
| Japanese | JPY |
| Simplified Chinese | CNY |
| English | USD |
| Traditional Chinese | TWD, or HKD when the browser region is Hong Kong |
| Korean | Not decided. USD is only a placeholder. |

Currency list, names, order, and these defaults are admin-managed.

## Rates

Each office posts a rate per currency, as two numbers:

- Into KRW (visitor gives foreign currency, receives won).
- Into foreign currency (visitor gives won, receives foreign currency).

Display unit is per 100 for JPY and per 1 for every other currency. Visitors enter reports in that same unit. Stored values are greater than 0, up to 5 integer digits and 2 decimal places.

The as-of timestamp is the time the rate was valid, not the time someone pressed save. Staff can set it to any time in the past 24 hours, defaulting to now. Future times are rejected. Public detail and the calculator show `YYYY.MM.DD HH:mm`. Cards and the saved list show `MM.DD HH:mm`. Times are Korea time. Whether the label also says KST is undecided.

A rate whose as-of time is older than the freshness window is needs update on the public site and in admin. The draft window is 24 hours and is not confirmed. Range is 1 to 168 hours.

A save that moves a rate by 5% or more asks for confirmation. Owner and operator edits are recorded separately from the as-of time, including who saved.

Offices choose which of the admin currencies they publish. Only checked currencies appear publicly.

## Admin

Desktop web. The owner home should also work on a phone browser. One login page for staff and owners. No self-signup. A super admin creates accounts and emails a temporary password. First login, and again 90 days after a password change, forces a password change. After 90 days the operator may postpone for 30 days. Five bad passwords lock the account. Ninety days idle marks it dormant. A super admin unlocks and resets. Session idle timeout is 30 minutes, with a warning 5 minutes before.

Draft password rule, not confirmed against a security policy: 8–16 characters, at least three of uppercase, lowercase, digit, and symbol. Cannot contain the login id, repeat one character three times, or match the previous three passwords.

Whether operator accounts are IP-restricted (owners stay open, because they are off-site) is undecided. A second factor is undecided. An audit log of admin access and of personal-data views is a later candidate, not in this spec.

### Roles

| Role | Access |
| --- | --- |
| Super admin | Everything, including accounts, operating settings, and image rules |
| Operator | Create and edit catalog, rates, content, and queues. Operating settings and image rules are view-only. No account admin |
| Read-only | View. No spreadsheet export |
| Office owner | Only offices linked to them |

Export of search results is super admin and operator only. If the file contains personal data, a reason is required.

Pending counts badge the owner-approval queue and the visitor-report queues.

### What operators manage

- **Offices.** Searchable list, show or hide. Hidden offices leave public lists, search, and saved lists immediately. New offices start hidden. Registration covers names, area, address, hours, payment methods, owner link, photos, tags, description, and an optional store notice. Address entry is search-only and fills Korean address, English address, and coordinates. One owner per office. One owner may hold several offices. Public id is a 5-digit serial, assigned once, never reused.
- **Rates.** Edit by office and currency, or import a spreadsheet (one file, up to 1,000 rows). Invalid rows are reported. Valid rows can be imported without the invalid ones. Sort puts needs-update and oldest as-of times first.
- **Owner edits that need approval.** Side-by-side before and after. Approve publishes immediately. Reject requires a reason and emails the owner.
- **Areas.** Two levels. Order is the public order. Airport child codes use IATA codes. “Not selected” is fixed. An area that still has offices can be hidden, not deleted.
- **Currencies and payment methods.** ISO 4217 code, localized name, display unit, four quick amounts, order, visibility. A currency with posted rates cannot be deleted. Draft payment methods: cash, VISA, Mastercard, JCB, WeChat, Alipay. Adding UnionPay is undecided.
- **Operating settings.** Freshness window, disclosure templates (`{as-of}` is filled per office), report thresholds, and which owner fields publish immediately. Super admin only. Changes apply immediately.
- **Image rules.** Shared upload limits. Super admin only. Changing them affects later uploads. Reprocessing files already stored is undecided.
- **Articles.** Notices, exchange guide, FAQ, and terms. Per language, Korean and English required. Optional date window. Up to three pinned items per type. FAQ has a category. Terms are versioned: the draft rule is a new version with an effective date and access to older versions, still under legal review.
- **Queues.** Rate reports and listing corrections or complaints. Rate-report rows for the same office, currency, and direction within 24 hours collapse into one row with a count. A gap of 3% or more is highlighted. Staff can reject, ask the owner to check, or jump to the rate editor. A newer rate posted after the report closes it automatically. Signed-in reporters are emailed. Correction requests store an internal note that is never public. Machine translation of those requests is undecided.
- **Comments and safety.** Hide, delete, ban the author, or block an IP. List IPs are partially masked. Full IP is limited and should be logged. Banned words apply to comments, nicknames, and report notes. Matching ignores case, width, and inserted spaces or symbols. A word can block submit or be masked with `***` (default is block). Unused words are not applied backward. Bans are write-only or full login block, for 1, 7, or 30 days, permanent, or a custom end. Login block also blocks a new account on the same social identity. Escalating repeat bans is not decided. IP or CIDR blocks can stop writes or the whole site, for the same durations. Staff cannot block their own current IP. Blocking a shared network range should be super-admin only. That limit is not signed off. How long IPs are kept is not signed off.
- **Accounts.** The four roles above. Owner accounts must be linked to at least one office that does not already have an owner.

### Office owner

Home shows only linked offices: what is public, what is stale, approval results, and visitor reports for those offices. The owner can open the public page.

Rate entry publishes immediately under the draft operating settings. The same 5% confirm and as-of rules as staff apply. A short preview shows the public line and the disclosure.

Profile edits follow the operating-settings split. Draft split: rates, hours, and descriptive content publish immediately. Name, address, payment methods, and phone need approval. While approval is pending, the public page keeps the old value and the owner cannot edit that field again. Content id, area, and visibility are staff-only. A reason is required when any field needs approval. Immediate fields in the same save still publish.

## Field and file rules

UTF-8 byte limits. ASCII is 1 byte, Hangul and Han characters are 3, emoji are 4. Trim ends. Collapse three or more line breaks to two. Fields of 300 bytes or more show a counter. Reject HTML except in the article editor, which allows a tag allow-list. Numbers use a numeric keypad and thousands separators.

| Field | Limit |
| --- | --- |
| Visitor amount | 1 through 12 digits. JPY and KRW are integers. Other currencies use 2 decimal places |
| Office name, per language | 120 bytes. Korean and English required |
| Tags | 5 tags, 45 bytes each |
| Office description, per language | 3,000 bytes. Korean and English required |
| Store notice, per language | 150 bytes, optional |
| Comment body | 1,500 bytes. Empty is allowed if there is a photo |
| Report and request notes | 600 bytes |
| Nickname | 4–30 bytes |

Uploads, before the file is stored: resize in the browser, strip location and device metadata, and do not keep the original EXIF. This cannot be disabled. Allowed types: JPEG, PNG, HEIC, WebP. GIF is not allowed. Original file up to 20MB. Store as WebP at quality 80% (allowed range 60–95%), or JPEG when the browser cannot show WebP. Do not upscale.

| Use | Count | Shape | Long edge | After conversion |
| --- | --- | --- | --- | --- |
| Office photo | 10 | 4:3 center crop. First image is the thumbnail | 1600 px | 1MB |
| Article thumbnail | 1 | 16:9 center crop | 1200 px | 500KB |
| Article body image | 20 | Original ratio | 1200 px | 1MB |
| Comment photo | 3 | Original ratio | 1280 px | 800KB |
| Rate-report photo | 2 | Original ratio | 1600 px | 1MB |

The office form text still says JPEG or PNG and 5MB per file. Treat the table above as the shared rule unless the owner decides otherwise.

## Who can do what

| Action | Signed out | Signed in | Write-banned | Login-banned or blocked IP |
| --- | --- | --- | --- | --- |
| Browse offices, rates, calculator, comments | Yes | Yes | Yes | View only. A full IP block shows a block page instead |
| Save an office | Browser | Account | Yes | No |
| Report a rate or a listing | Yes | Yes | No | No |
| Write or report a comment | No | Yes | No | No |

## Main data

- **Language, currency, payment method, area.** Reference rows with localized labels, order, and visibility. Currency adds ISO code, quote unit, quick amounts, and the per-language default.
- **Office.** Public id, visibility, localized name and description, tags, notice, area, Korean and English address, coordinates, phone, weekly hours, payment methods, photos, linked owner.
- **Rate.** Office, currency, into-KRW value, into-foreign value, as-of time, who saved it, and a history distinct from as-of.
- **Visitor.** Optional social identity, nickname, language, currency, distance unit, and account-level saves.
- **Browser save.** Device-local office ids until login merges them.
- **Rate report.** Office, currency, direction, posted rate, reported rate, observed time, note, photos, reporter (account or anonymous), status.
- **Listing request.** Type (correction or complaint), office, note, language, status, internal staff note.
- **Comment.** Office, author, language, body, photos, edit flag, status, reports.
- **Moderation.** Banned words, user bans, IP or CIDR blocks.
- **Article.** Type, language variants, window, pin, and for terms a version and effective date.
- **Staff account.** Login id, role, status, and for owners the linked offices.
- **Owner change request.** Field-level before and after, reason, approve or reject.

## Not decided

These are open in the source document. Do not treat the draft values above as final where this list disagrees.

- Legal text for rate disclosures, terms versioning, and signup consent including the age check.
- Korean default currency.
- Freshness window (draft 24 hours) and whether timestamps say KST.
- Contact channels per language.
- Social providers and the simplified-Chinese order.
- Operator IP allowlist, admin second factor, and confirmation of the password rule.
- Translation API for office copy and for visitor requests.
- UnionPay.
- Reprocessing stored images after a rule change.
- IP retention, who may view a full IP, and repeat-ban escalation.
- Shared-network IP blocks limited to super admins.

## Integrations

No credentials belong in the repo. Expected external pieces, all unset:

- Social OAuth for visitors.
- Address search that returns a Korean address, an English address, and coordinates.
- A map directions URL.
- Email for report outcomes, owner decisions, and staff temporary passwords.
- Optional translation API.

Browser geolocation and Web Share need no server secret.
