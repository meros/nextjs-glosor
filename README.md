# Glosor

A web app for practicing vocabulary ("glosor" in Swedish), built with [Next.js](https://nextjs.org/) and [Mantine](https://mantine.dev/).

Live at https://glosorna.se

## What it does

You type in word lists, then the app quizzes you on them. It is made for school vocabulary homework: enter this week's words once and practice until you know them. The interface is in Swedish.

- Create, rename and delete word lists. Each list has a from-language and a to-language.
- Practice in both directions, or only one.
- Words you have answered correctly the fewest times come up first, and the same word does not come twice in a row.
- A wrong answer shows the right one and waits for you. A correct answer moves on by itself.
- Case-sensitive checking can be switched off.
- Share a word list as a link. The list is encoded in the URL, so there is no server or account. Opening a link adds the list to the visitor's own lists.
- Works on a phone first, and on a desktop. Light and dark mode follow the device.

Word lists and practice progress are stored in the browser's localStorage.

## Run locally

Requires Node.js 20.9 or later.

```sh
npm install
npm run dev
```

Then open http://localhost:3000.

## Scripts

```sh
npm run dev           # development server
npm run build         # production build
npm start             # serve the production build
npm run typecheck     # TypeScript
npm run lint          # ESLint
npm run format        # Prettier (format:check only reports)
npm test              # unit and component tests (Vitest, Testing Library)
npm run test:e2e      # browser tests (Playwright), mobile and desktop
npm run check         # typecheck, lint, tests and build
```

## Tests

- `src/lib/*.test.ts`: the logic with no UI. Word lists, answer checking, picking the next word, share links, saved data.
- `src/**/*.test.tsx`: components and pages with Testing Library. They run against the real providers and a fake `localStorage`.
- `e2e/`: Playwright against the production build, on a phone-sized and a desktop-sized browser. It covers every user flow, share links (including links made by the old version), accessibility with axe in light and dark mode, horizontal overflow, touch-target size and input font size. Screenshots for review land in `test-results/shots/`.

The browser tests need a Chromium. Run `npx playwright install chromium`. On NixOS set `CHROME_PATH` to a Chrome or Chromium binary instead.

## Status

Personal project. It works and is in use at glosorna.se, with occasional updates.

## License

0BSD. See [LICENSE](LICENSE).
