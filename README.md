# codereal.app

CodeReal is an app that challenges users to solve a daily coding question.

## Background

I had this idea for this app last year (2022) during the height of the initial [BeReal](https://bereal.com/) craze... BeReal but for code.

I set out to create the app with Python and React on AWS Lambda. I quickly found that building a severless application beyond a few functions was quite cumbersome without a deployment framework. I attempted to write IaC for everything (functions, DynamDB tables, IAM roles, etc) with CloudFormation, but quickly got burned out and never finished the applicaiton.

In the beginning of 2023 I was introduced to Vercel and nextjs. At my job, I was tasked with migrating a rather large nextjs application from Vercel to AWS (containerized on ECS) to increase backend performance. The team decided that the performance boost was worth the increased cost of a always-running server. However, I quickly realized how useful Vercel's atomic deployments were (as well as other features like secret managment, DNS, etc) as I worked to automate the deployment of this application without Vercel. I figured this would be a good bet for my next side project.

In summer of 2023 I stumbled upon Theo's [T3 stack](https://t3.gg/) that utilized nextjs as well as several other services to make building a full webapp quite easy. I love how easy it is to integrate my frontend and backend code in a type-safe way. I wanted to give it a try!

So, I got to work rewriting this app in javascript using the T3 stack, and I was able to pretty much finish the core functionality in about half the time I originally spent to implement ~60% of the original version.

Anyway, I hope you find this project cool!

## Tech stack

This is a T3 Stack project, bootstrapped with [create-t3-app](https://create.t3.gg/).

Full stack:

- [Next.js](https://nextjs.org) for React framework
- [Clerk](https://clerk.com/) for authentication
- [Prisma](https://prisma.io) for database ORM
- [PlanetScale](https://planetscale.com/) for serverless database (MySQL)
- [Tailwind CSS](https://tailwindcss.com) for frontend styling
- [tRPC](https://trpc.io) for backend API

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

### Distant future work

- add more languages!

---

Copyright 2023 Noah Kurrack. All rights reserved.
