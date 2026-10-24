# Exchange-office finder — MVP

Info-only web app for foreign tourists comparing exchange-office rates in Seoul. No money moves. Mobile-first, and usable on desktop. Language paths: `/en` (default), `/ja`, `/zh-cn`, `/zh-tw`, `/ko`.

The repo is still the vinext starter (`atlas-board` placement map, empty database, no offices or accounts). This spec does not choose a framework or host.

## In MVP

1. **OAuth sign-up / login**
   - Google on every language, plus one more provider still to confirm (Apple or LINE). No password accounts.
   - Viewing is open to everyone. Login is optional.
   - Login may unlock saved offices synced to the account. That payoff is not decided (see Open decisions).
   - Consent on sign-up: a 14+ checkbox, plus terms and privacy. All three are required.
2. **Map view**
   - Areas come from config: Seoul > Myeongdong, Seoul > Hongdae, Airport > ICN.
   - One pin per office. The pin label shows the rate for the selected currency.
   - Tap a pin to open a bottom-sheet card, then the office detail.
   - Use browser location when granted. Otherwise center on the selected area.
3. **Card view**
   - Toggle with the map. Each card shows shop name, image, rate for the selected currency, timestamp `MM.DD HH:mm KST`, and payment-method tags.
   - If the rate is older than 24 hours, mark it "needs update".
   - Sort by best rate (default) or distance.
   - Disclaimer at the top: rates are as registered by the shop, may differ in store, and fees are not included.
4. **Office detail**
   - Rate table with the selected currency first. JPY is quoted per 100. Other currencies are per 1.
   - Hours, Korean and English address, a directions link, and share.
5. **Currency selector**
   - Default follows language: Japanese → JPY, simplified Chinese → CNY, traditional Chinese → TWD (HKD when the region is Hong Kong), English and Korean → USD.
   - The choice is stored locally.
6. **Admin (single admin, strong auth)**
   - Create and edit offices: area, coordinates, payment methods.
   - Enter rates with a timestamp. The timestamp cannot be in the future and cannot be more than 24 hours old.
   - CSV or Excel bulk upload of that data.

## Deferred

Calculator and comparison, rate reports, comments, alerts, owner accounts and approval, moderation, WeChat login, a settings page, and LINE or WeChat contact channels.

## Open decisions

- Second OAuth provider: Apple or LINE. LINE fits Japanese and Taiwanese tourists.
- Map provider: Google Maps (familiar to foreigners, weaker Korea detail) or Naver/Kakao (better Korea data, less familiar UI).
- What login gives the visitor in this MVP. Saved offices are the candidate. Without that, login is friction with no payoff.
