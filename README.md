# ZeroCut

**The anti-Gumroad. Sell digital files direct in crypto. No middleman. No tax. Keep 100%.**

---

## What It Is

ZeroCut is a frontend-only store protocol for creators who want full ownership. Fork the repo, drop in your product JSON, set your wallet address, deploy somewhere (Cloudflare Pages, Vercel, Arweave — whatever). Buyers pay you in SOL, the transaction confirms on Solana, and the download link unlocks instantly. No backend. No platform fees. No gatekeepers.

It's built for creators who don't want to hand over 30% to Gumroad or deal with Stripe's "your account has been restricted" emails. If you can edit a JSON file and push to GitHub, you can run your own store.

---

## The Raw Deal

Let's be real about what you're getting:

- **Links aren't secret.** Once the transaction confirms, the download URL sits in the frontend. Anyone who pokes around your config or sniffs the JSON can grab the link. No DRM in v1. If someone's determined, they can pirate it.
- **No refunds.** It's direct wallet-to-wallet. If you ghost after someone pays, there's no chargeback. The buyer is trusting you. Don't be that person.
- **Crypto only.** Fiat? Convert it yourself.
- **RPC delays happen.** Solana's fast, but not magic. Sometimes RPC nodes lag. If the UI says "pending" for 30 seconds, just wait or check your wallet.

This is P2P. It respects your freedom and assumes you're not a scammer. Act accordingly.

---

## Quick Start

1. **Fork the repo**
2. **Edit your config** — set `VITE_PRODUCT_JSON_URL`
`VITE_METADATA_JSON_URL`
3. **Drop your product data** in your json file (or host it somewhere and point to it)
4. **Run it locally:**
   ```bash
   npm install
   npm run dev
   ```
5. **Deploy** — push to Cloudflare Pages, Vercel, Arweave, or any static host. That's it.

---

## Full Docs

Detailed setup guide, config options, deployment tips, and troubleshooting:

**[ZeroCut Wiki →](https://github.com/yourusername/ZeroCut/wiki)**

---

## Want to Contribute?

Yeah, we could use help. Here's where it gets interesting:

- **Encryption / gated downloads** — thinking Lit Protocol or client-side encryption to actually hide the link
- **Multi-chain** — extend to Ethereum, Base, Solana (already here), whatever
- **Better fiat on-ramps** — make the "convert to crypto" step less painful
- **Bulk upload, discount codes, analytics** — stuff Gumroad does that we'd rather build ourselves

Open an issue. Submit a PR. If you ship something clean, we'll shout it out.

Bounties? Maybe eventually. For now, DM me on Discord- "y.u.r.e.i.d.r.e.a.m.s" if you build something cool.

---

## License

MIT — do whatever, just don't blame us if things break.

---

Built by **Aevon**, a random dev from India.

**Discord:** "y.u.r.e.i.d.r.e.a.m.s"
**Site:** [Aevon](https://aevon.pages.dev)

---

Fork it. Sell shit. Keep the bag. Simple.