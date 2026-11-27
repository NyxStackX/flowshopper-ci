# Mockups

Mockups of the store and the back-office, made for the brainstorm with the AI team (bootstrap step C1). They show where each recommendation appears and how the villager stays in charge of it. The editable version lives on the team's design canvas; these images are its export.

## Screens

1. `01-home-desktop.png` - home page on a computer: search, aisles, "Your weekly shop" with the usual cart, "Don't forget", usual and popular products.
2. `02-product-replace-with.png` - product page with a declared allergen: warning, then "Replace with" suggestions without it.
3. `03-home-phone.png` - home page on a phone: the same features in one column, with a bottom menu.
4. `04-first-visit-phone.png` - first visit: display needs, allergies, diet, favorite aisles and the two separate consents.
5. `05-cart-payment-phone.png` - cart and payment, then the order status updated live after the payment provider's webhook.
6. `06-backoffice-sales-stock.png` - back-office, Sales and stock: key figures, best sellers chart with its data table, stock alerts, products reported out of stock.
7. `07-backoffice-recommendations.png` - back-office, Recommendations and usage: shown, clicked, added and dismissed per feature, with simulated sessions filtered out.

## Design choices

- **Type**: Plus Jakarta Sans for the whole interface.
- **Colors**: white background, near-black text `#1A1523`, dark buttons, violet `#5B2FD6` for suggestions and links, pastel tints only behind product images. Every text color passes WCAG 2.2 AA contrast (4.5:1 or more).
- **Suggestions**: each one shows its reason, can be hidden ("Not now" or the close button), and never adds anything to the cart by itself.
- **Accessibility**: real buttons, links and form labels, touch targets of 44 px or more, every chart paired with a data table, live updates announced with `aria-live`.

## Data shown

- Product names, prices, reasons and back-office figures come from the provided CSV files (villager `V-0003`, last 30 days for the back-office).
- The "Replace with" reasons are written by hand, because similar products are not implemented yet.
- `[N]` and `[FEATURES]` mark figures that will come from real sessions.
