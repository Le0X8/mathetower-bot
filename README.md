# mathetower-bot

Discord bot for campus info, utility automation, and a persistent banana economy game.

## Stack
- Node.js + TypeScript
- `discord.js`
- `@napi-rs/canvas` (image rendering)
- Rust subproject (`/gpt6`) for text generation (`/gpt6`, `/random`)

## Requirements
- Node.js 20+
- pnpm 10+
- Rust toolchain (`cargo`) for build

## Setup
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create config file:
   ```bash
   cp config.default.json config.json
   ```
3. Fill all fields in `config.json`.
4. Start in dev mode:
   ```bash
   pnpm dev
   ```

## `config.json` fields
- `discord_token`: Bot token
- `bot_uid`: Bot user ID
- `owner_uid`: Owner user ID for error DMs and owner commands
- `home_gid`: Guild ID where admin commands are allowed
- `notifications_cid`: Channel ID for plantage infection notifications
- `status_cid`: Channel ID for stderr status messages
- `env`: Environment label used in status messages

## Scripts
- `pnpm dev`: Run bot with `tsx`
- `pnpm lint`: Lint `src`
- `pnpm build`: Build Rust `gpt6` binary, then bundle TypeScript with `tsup`
- `pnpm test`: Placeholder script that exits with error

## Feature overview
- **Command and interaction platform**
  - Auto-registers and updates slash commands in every joined guild on startup.
  - Enforces admin-only commands in the configured home guild.
  - Uses interactive components (buttons/select menus) for multi-step flows (e.g. plantage upgrades, lab actions, S1 selection).
  - QoL: command names are normalized from underscores to dashes, and outdated component UIs are cleaned up after timeout.

- **Campus utility features**
  - Mensa integration with multi-location output (`Mensa`, `FoodFakultät`, `Galerie`, or all) and vegan/vegetarian filtering.
  - Exam planner with module-specific lookup and admin-maintained dates.
  - S1 delay tracker that fetches live departures, stores selected trips, scores delays, and rewards cancellations with fixed bonus points.
  - QoL: duplicate S1 submissions are blocked, train IDs are hashed, and results are shown in compact embeds.

- **Banana economy and progression game**
  - Persistent inventory economy with typed bananas, value normalization, transfers, gifting, gambling, trading, lootbox skins, and leaderboards.
  - Prestige loop with permanent multipliers, reset mechanics, donor share system, and minute-based passive farming payouts.
  - Plantage management with land/multiplier upgrades, max-buy strategies, mutation activation, and infection-based progression constraints.
  - Mutation/lab subsystem for generating, merging, valuing, sharing, and applying gene-based buffs (speed, rarity, infection resistance, pricing, investment effects).
  - QoL: supports shorthand numeric input (`k`, `M`, `G`, ...), role-wide gifting, trade preview before accept, and automatic split follow-up replies for long gift result lists.

- **Generated content and media features**
  - Rust-powered GPT6 process serves `/gpt6` and `/random`, including optional next-token weight output.
  - Automatic text dataset collection and periodic GPT6 retraining cycle.
  - Media commands for CS-style killfeed image generation and additional image-based fun output (`/waow`, era images).
  - QoL: output is sanitized/trimmed for Discord limits, GPT requests are queued serially, and command fallbacks use nicknames/global names when available.

- **Message automation and chat QoL**
  - Automatic social-link rewriting for X/Twitter, Instagram, TikTok, Reddit, and YouTube links to alternative frontends.
  - Per-user opt-out/opt-in control for link rewriting via `/novx` and message-level overrides (`!novx`, `!vx`).
  - Automatic tracking-parameter stripping (`igsh`, `s`, `fbclid`, `si`, `utm_*`) from rewritten links.
  - Reactive chat behavior: yes/no reactions for polar questions, referenced `kys` letter reactions, and keyword-triggered custom emoji reactions.

## Runtime files
- `data.json`: Persistent bot state (auto-created)
- `dataset.txt`: Collected message text used for GPT6 training
