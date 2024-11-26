# Telegram Bot Starter

## Tech stack

- Core: Node.js with TypeScript
- Framework: NestJS
- Database: PostgreSQL (serves both as primary database and caching layer)
- Query Builder: Kysely
- Logging: Winston for structured logging, with message forwarding to a Telegram chat
- Telegram Bot Client: GrammyJS

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run dev

# production mode
$ pnpm run start:prod
```
