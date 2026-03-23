# The Simpsons Index

### Prediction Intelligence Database

A structured database tracking every documented Simpsons prediction — scored for specificity, classified by outcome, and verified against real-world events. Covers 790 episodes across 35 seasons, with debunked internet fabrications included and clearly labelled.

Live tool: [simpsons-index.netlify.app](https://simpsons-index.netlify.app)

---

## The Idea

The Simpsons has been running since 1989. Over that time, its writers have made hundreds of satirical jokes about the future — and a surprising number have come true. This project asks: how many, how specific, and does the pattern hold up to scrutiny?

The investment angle lives in the **Pending Signals** tab — predictions that haven't resolved yet, ranked by specificity. The honest caveat lives in the Scoreboard: showrunner Al Jean has said it best — *"if you throw enough darts, you're going to get some bullseyes."* With 790 episodes, some hits are statistical inevitability. This tool makes the distinction visible.

---

## Tabs

**Scoreboard** — Confirmed and wrong predictions only, ranked by specificity score. Lead story is always the strongest documented hit.

**Pending Signals** — Unresolved predictions that haven't come true yet. The forward-looking tab.

**All Predictions** — Everything in the database, including debunked claims and internet fabrications. Filterable by category and outcome.

---

## Scoring

Each prediction is rated across five dimensions:

**Specificity score (1–5)** — How precise was the prediction at the time of airing? A score of 5 means the show named specific people, dates, or outcomes. A score of 1 means thematic satire that loosely resembles something that later happened.

**Outcome** — Confirmed / Wrong / Pending / Debunked

**Confidence** — High / Medium / Low, reflecting source quality and verifiability

**Years lead** — How far in advance the episode aired before the real event

**Category** — Politics · Technology · Sports · Science · Business · Entertainment · Health

---

## Data Sources

55 predictions in the seed dataset, drawn from:

- Wikipedia — The Simpsons future predictions (structured, cited)
- Hollywood Reporter — 34 Times the Fox Show Forecasted the Future
- Snopes — Simpsons predictions fact-check archive (debunked claims)
- Collider — 57 predictions list
- Bored Panda — 2026 predictions roundup
- Screen Rant — 2020s predictions

---

## Built With

React · Vite · Georgia serif · Wikipedia REST API · Netlify · GitHub

---

## Roadmap

- Supabase backend to replace static JSON
- Admin panel for adding predictions without redeployment
- Expand dataset to 150+ predictions via episode synopsis pipeline
- Hit rate analytics by category, decade, and writer

---

## About

Built as a side project exploring whether pop culture satire contains extractable signal — and as a practical exercise in building and shipping a data-driven web tool end to end.

*Built by Siddharth Hingorani — March 2026*
