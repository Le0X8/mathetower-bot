# mathetower-bot

Discord bot for slash commands, campus info, and a banana economy game.

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

## Slash commands
### Info
- `/help`
- `/mensa`
- `/klausuren`
- `/novx`

### Game / fun
- `/bananen`
- `/plantage`
- `/labor`
- `/mutation`
- `/trade`
- `/accept`
- `/gift`
- `/gamble`
- `/leaderboard`
- `/lootbox`
- `/kill`
- `/era`
- `/waow`
- `/schnellbahn1`
- `/minuten`
- `/gpt6`
- `/random`

### Admin / debug / owner
- `/set-exams` (admin, only in `home_gid`)
- `/bugreport`
- `/error`
- `/zzz-debug`
- `/zzz-owner-editcash`
- `/zzz-owner-replacewords`

## Runtime files
- `data.json`: Persistent bot state (auto-created)
- `dataset.txt`: Collected message text used for GPT6 training

## Behavior highlights
- Registers/updates slash commands on startup for all guilds the bot is in.
- Runs a minute-based plantage routine for passive earnings and infection events.
- Rewrites social media links to alternative frontends unless disabled per user with `/novx`.
- Retrains GPT6 periodically and posts stderr updates to `status_cid`.
