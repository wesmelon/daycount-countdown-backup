# Daycount — Countdown backup & modern edition

The original Daycount idea: **Wedding · T−99 days**. This repository separates the event-countdown app from the daily streak tracker at [wesmelon/daycount](https://github.com/wesmelon/daycount).

## Modern edition

`docs/` contains a mobile-friendly, dependency-free replacement UI:

- Create, edit and delete events with a target date, category and notes.
- T−99 for future events, Today on the date, T+12 for past events.
- Next-event spotlight, category/search filters, upcoming/past views, and date/name sorting.
- Local-browser persistence and validated JSON backup/restore.
- Calendar-day arithmetic across daylight saving and leap years; refreshes after midnight and on returning to the app.

Run `python3 -m http.server 8080 --directory docs` and open `http://localhost:8080`. For a hosted version, GitHub Pages can serve `main` → `/docs`. No build step or npm dependencies are required. Use HTTPS for browser UUID support when accessing from another device.

Run tests: `node --test docs/model.test.mjs` (Node 18+).

This modernization replaces the old Go/AngularJS runtime. It does **not** migrate PostgreSQL data, accounts, sessions, or sharing. Data stays in the current browser and does not sync between devices. Export backups regularly. Dates represent local calendar dates, not countdowns to a precise timezone/time of day.

## Original source backup

`legacy-original/` preserves every file from `wesmelon/daycount` commit `a49128db16bb410cc657adffcd803934daeedc74`, before the streak tracker was added. `legacy-manifest.json` records SHA-256 hashes for byte-for-byte verification. Original Git history remains in the source repository; this is a source snapshot, not a separate copy of the entire Git history or the old database.

The old source is reference-only and is **not** deployed by the modern app. It retains the original hard-coded development configuration and outdated dependencies. Do not run it as a production service. Keeping it unchanged makes the backup reproducible.
