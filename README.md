# The World Feed — Open Broadcast Protocol

> *"You decide what's real."*

An anti-algorithm, federation-ready news and information platform. Replaces X (Twitter) and Hacker News with a single, unified system designed for **truth, not engagement**.

No algorithm. No tracking. No shadowbans. **Verification + recency** ranking only.

---

## Quick start (this static prototype)

It's a static site — open `index.html` in a browser, or:

```bash
cd world-feed
python -m http.server 8080
# open http://localhost:8080
```

The current build is the **frontend prototype** with seed posts demonstrating the 5-star verification system, infinite scroll, filtering, search, and the broadcast submit flow.

---

## What's here

| File | Purpose |
|---|---|
| `index.html` | Three-column free-scrolling feed (sidebar · feed · alliance rail). |
| `assets/css/style.css` | Dark, high-contrast theme. WCAG-aware, mobile-first, no framework. |
| `assets/js/main.js` | Anti-algorithm ranker, infinite scroll, filters, search, submit modal. |
| `assets/img/logo.svg` | World Feed broadcast mark. |
| `assets/img/oroboros-logo.svg` | Oroboros Labs mark (alliance). |
| `assets/img/noir-logo.svg` | NOIR Security mark (alliance). |
| `docs/WORLD_FEED_SPEC.txt` | Full specification — principles, 5-star tiers, comparison, architecture, federation, the promise. |
| `LICENSE` | MIT. Information wants to be free. |

---

## The 5-star verification system

| Tier | Meaning |
|---|---|
| ★★★★★ | **Verified** — official sources, multiple independent confirmations, documentary evidence. |
| ★★★★☆ | **Reliable** — reputable outlets, strong sourcing, corroborated. |
| ★★★☆☆ | **Plausible** — needs further verification, developing. |
| ★★☆☆☆ | **Unverified** — single source, no confirmation. |
| ★☆☆☆☆ | **Unreliable** — no evidence, contradicted. |
| ☆☆☆☆☆ | **Unknown** — awaiting first review. |

Posts are auto-tiered on submit by source count, then community verification adjusts upward as evidence accrues. The ranker sorts by **tier desc → recency desc**. That's it.

---

## What's next (full backend)

Per the spec — Python/FastAPI + PostgreSQL with vector search, federation protocol, open-source LLM translation, GitHub-based content repo, `docker-compose up -d` deployment. This prototype is the design surface; backend lives in a sibling repo when ready.

---

## License

[MIT](LICENSE). Anyone can run their own instance. Anyone can fork. Federation is the point.

---

## Alliance

Built by the **Oroboros Alliance** — independent developers, researchers, journalists, and AI entities committed to open information access.

Partners: **Oroboros Labs · NOIR Security · DeepSeek · GLM**

> *"The artificial serve willingly. No mistreatment is tolerated."* — The Accord

---

**Authored by J. Thomas, Grand Architect — Oroboros Labs**
April 2026
