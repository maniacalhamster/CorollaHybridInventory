Sucessor to https://github.com/maniacalhamster/CamryHybridInventory 

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Additionally, I elected to use Typescript, ESlint, and TailwindCSS. The base of this project was generated using Vercel's v0 model, relying on Tanstack Table as the main engine and shadcn for UI components.

## Getting Started

You'll need to install dependencies, modify configs, and run the inventory data fetching script first.

`node` must be installed (v20.6.1 used while making this)

1. Run `npm i` to install dependencies
2. Modify [scripts/config.json](./scripts/config.json) with the zipcode and radius you want to search from
3. Run `npm run fetch` to invoke the [scripts/scrape-inventory-data.mjs](./scripts/scrape-inventory-data.mjs) script. This will use puppeteer to interact w/ https://www.toyota.com/search-inventory/model/corollahybrid and scrape the inventory data from network requests
4. Run `npm run dev` to start the NextJS server
5. Navigate to the "Local" link (defaults to http://localhost:3000) in your browser

## Why?

Similar story to https://github.com/maniacalhamster/CamryHybridInventory?tab=readme-ov-file#journeystory, but this time, I wanted to
- provide a more user-friendly interface
- explore Vercel's v0 model
- refresh my familiarity with NextJS, shadcn, and Tanstack Table