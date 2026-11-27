# DECISIONS.md

Newest first. One entry per decision, with this structure:

## YYYY-MM-DD — Title
1. **Context**: what had to be decided, and why then.
2. **Positions**: what each team wanted, disagreements included.
3. **Decision**: what was decided, and by whom.
4. **Impact**: on each team's work and on the planning.
5. **Contract change**: none, or the new contract version.

## 2026-11-27 - Web stack: React, Vite and Express

1. **Context**: step 2 of the Web plan starts the site. The stack had to be chosen before any screen is built.
2. **Positions**: React with Vite, plain HTML and JavaScript, or Next.js. Plain HTML means more hand-written code for the cart and live updates; Next.js is heavier to learn for a short project.
3. **Decision**: React with Vite for the store and the back-office, Node.js with Express for the server, in one `web/` package started by `npm run dev`. The catalog is read once from the provided CSV file and kept in memory. Decided by Lina.
4. **Impact**: the Web team builds components reused across screens. The AI team is not affected: the site will call the recommendation API through the server.
5. **Contract change**: none.

## 2026-11-25 - Look and layout of the store

1. **Context**: the Web team needed mockups of the store and the back-office for the brainstorm with the AI team (bootstrap step C1), before building any screen.
2. **Positions**: two first versions were rejected by Lina: one green and terracotta, one rounded pastel, both judged not professional enough. The AI team has not given its view yet.
3. **Decision**: a professional online grocery layout (search, aisles, rows of product cards), Plus Jakarta Sans, white background, near-black text, violet for suggestions, pastel only behind product images. Seven screens in `docs/mockups/`. Proposed by Lina, to confirm with Loris at the brainstorm.
4. **Impact**: the Web team builds the screens from these mockups from step 2 on. Each suggestion keeps its reason and its "Not now" button, so the AI team must always return a reason.
5. **Contract change**: none.
