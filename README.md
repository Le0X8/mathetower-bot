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
- **Slash command platform**
  - Registers and updates command definitions across all guilds on startup.
  - Supports normal, admin-gated, debug, and owner-only command categories.

- **Campus info workflows**
  - Mensa menu retrieval with location and dietary filtering.
  - Exam date lookup by module plus admin-managed exam date updates.
  - Embedded help output and user-facing error reporting.

- **Persistent banana economy**
  - Per-user inventory with multiple banana types and value-based accounting.
  - Transfer, gifting, gambling, shop, ranking, and progression mechanics.
  - Data is persisted in `data.json` via the internal key-value store.

- **Plantage progression system**
  - Passive minute-based earnings using land, multipliers, prestige, and mutation buffs.
  - Upgrade modes for single buys, balanced maxing, and strategy-specific maxing.
  - Infection lifecycle with progression thresholds and gameplay restrictions.

- **Mutation and infection gameplay loop**
  - Laboratory command flow to craft and apply mutation effects.
  - Mutation buffs affect rarity, growth speed, infection behavior, and pricing.
  - Infection milestones trigger notifications and temporarily disable capabilities.

- **GPT6 text generation integration**
  - Background Rust process serves completions for `/gpt6` and `/random`.
  - Queued request handling with periodic retraining from `dataset.txt`.
  - Runtime stderr forwarding into the configured status channel.

- **Message-level automation**
  - Rewrites social media links to alternative frontends; users can opt out with `/novx`.
  - Strips common tracking query parameters in rewritten URLs.
  - Applies trigger-based emoji reactions and lightweight interaction behaviors.

## Runtime files
- `data.json`: Persistent bot state (auto-created)
- `dataset.txt`: Collected message text used for GPT6 training
