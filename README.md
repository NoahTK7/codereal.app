# codereal.app

CodeReal is an app that challenges users to solve a daily coding question.

## Tech used

This is a T3 Stack project, bootstrapped with [create-t3-app](https://create.t3.gg/).

Full stack:

- [Next.js](https://nextjs.org) for React framework
- [Clerk](https://clerk.com/) for authentication
- [Prisma](https://prisma.io) for database ORM
- [PlanetScale](https://planetscale.com/) for serverless database (MySQL)
- [Tailwind CSS](https://tailwindcss.com) for frontend styling
- [tRPC](https://trpc.io) for backend API

## Inspiration

I had this idea for this app last year (2022) during the height of the initial [BeReal](https://bereal.com/) craze... BeReal but for code.

This app is also inspired by:

- [code golf](https://www.reddit.com/r/codegolf/)
- [bnomial](https://bnomial.com)
- [Wordle](https://www.nytimes.com/games/wordle/index.html)

## Future work

- share score button (mobile and web)
- add Google as a third-party login
- per-question page where you can solve past questions individually
  - accessible via a past questions page with list, similar to current past submissions list page
- consolidate loading states using React's new suspense boundaries (it's a bit of a waterfall at the moment)
- add a "current streak" (i.e. questions answered in a row) to user stats
