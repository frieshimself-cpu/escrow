# SupplyFun

An escrow-secured creator token launchpad website. Anyone can launch a token
for a creator — the creator's supply allocation is locked in an on-chain
escrow until the verified creator (via X sign-in) claims it.

Inspired by the structure of modern Solana launchpad sites, rebuilt with
original copy, original artwork, and a dark lime/emerald theme.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Landing page — hero, live stats, how-it-works, feature deep-dives, trending launch gallery, milestone liquidity tracker |
| `explore.html` | Full launch gallery with filter tabs (All / Trending / New / Unclaimed / Boosted / Airdrops) |
| `launch.html` | Token deploy form with live escrow preview |
| `claim.html` | Creator claim flow (X verify → wallet → claim) |

## Stack

Pure static HTML/CSS/vanilla JS — no build step, no dependencies. Deploy to
any static host (GitHub Pages, Netlify, Vercel, S3…).

```bash
# run locally
python3 -m http.server 8000
# then open http://localhost:8000
```

## Notes

- All launch data, creator handles, and metrics are **fictional demo data**
  (`js/data.js`).
- Wallet connect, deploy, and claim flows are **simulated** in the UI —
  `js/main.js` marks the places to wire up a real wallet adapter and program.
