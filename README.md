# Glosor

A web app for practicing vocabulary ("glosor" in Swedish), built with [Next.js](https://nextjs.org/) and [Mantine](https://mantine.dev/).

Live at https://glosorna.se

## What it does

You type in word lists, then the app quizzes you on them. It is made for school vocabulary homework: enter this week's words once and practice until you know them. The interface is in Swedish.

- Create, rename and delete word lists. Each list has a from-language and a to-language.
- Practice in both directions, or only one.
- Words you have answered correctly the fewest times come up first.
- Case-sensitive checking can be switched off.
- Share a word list as a link. The list is encoded in the URL, so there is no server or account.

Word lists and practice progress are stored in the browser's localStorage.

## Run locally

Requires Node.js 18 or later.

```sh
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts:

```sh
npm run build      # production build
npm start          # serve the production build
npm run lint       # ESLint
npm run storybook  # component stories on http://localhost:6006
```

## Status

Personal project. It works and is in use at glosorna.se, with occasional updates.

## License

0BSD. See [LICENSE](LICENSE).
