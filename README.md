# Bonus Hunt Tracker

A fast, local-first tool for tracking online casino bonus hunts: log each slot's
bet size and buy cost up front, reveal the win as you open it, and watch your
profit/loss and break-even multiplier update live.

Currently client-only — everything saves to your browser's localStorage. No
backend, no login, nothing to deploy but static files.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed localhost URL. That's it.

## Deploy it (so it's usable from anywhere in ~1 minute)

Push this repo to GitHub, then:
- **Vercel**: [vercel.com/new](https://vercel.com/new) → import the repo → it
  auto-detects Vite → Deploy.
- **Netlify**: [app.netlify.com/start](https://app.netlify.com/start) → same idea,
  build command `npm run build`, publish directory `dist`.

Both are free for this use case and give you a live URL in under a minute.

## Get this into a repo + Claude Code

```bash
cd bonus-hunt-tracker
git init
git add .
git commit -m "Initial bonus hunt tracker MVP"
gh repo create bonus-hunt-tracker --public --source=. --push
# (or create the repo on github.com first, then: git remote add origin <url> && git push -u origin main)

claude
```

Once you're in Claude Code, some good next prompts to keep vibe-coding:

- "Add a settings toggle for dark/light felt themes"
- "Add drag-to-reorder for slots before opening starts"
- "Add a 'presenter mode' — big fullscreen view for streaming with just the
  current slot and running total, keyboard-driven"
- "Persist hunts to a Supabase table instead of localStorage so I can access
  from multiple devices"
- "Add a bonus hunt history page comparing profit across past hunts"
- "Add screenshot/share-card export of the final results table"

## How the numbers work

- **Cost** is what you pay to buy/enter each bonus round (or your bet size if
  you're not buy-bonusing). Paid up front, known before any reveals.
- **Win** is filled in as you open each slot — this is the only thing that
  changes live.
- **Break-even multiplier** = (total cost so far − total win so far) ÷ (sum of
  bets on unopened slots). It's the average multiplier you need across the
  remaining slots to walk away even.

## Project structure

```
src/
  App.jsx              orchestrates state + localStorage persistence
  calc.js              all the hunt math (pure functions, easy to test)
  storage.js           localStorage read/write + factory functions
  components/
    HuntHeader.jsx      hunt switcher, sort toggle, export, new/delete
    NewHuntForm.jsx     create-hunt inline form
    SummaryBar.jsx      cost / win / profit / break-even stat row
    AddEntryForm.jsx    add-a-slot inline form
    EntryTable.jsx      the ledger table + inline win entry
```
