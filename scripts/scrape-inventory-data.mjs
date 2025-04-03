import puppeteer from "puppeteer";
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from "url";

/**
 * main body of the script I want to run
 * @param {import("puppeteer").Page} page
 */
async function script(page) {
    const curr_dir = path.dirname(fileURLToPath(import.meta.url))
    const filename = `${model}.json`
    const dest_path = path.join(curr_dir, '..', 'public', filename)

    const inventory_url = `https://www.toyota.com/search-inventory/model/${model}/?zipcode=${zipcode}`
    const graphql_url = "https://api.search-inventory.toyota.com/graphql";
    const distance_sel = 'select[name="distance"]';

    await page.goto(inventory_url);
    debugger;
    await page.waitForSelector(distance_sel);
    page.select(distance_sel, "100").then(() => console.log(`distance set to: ${distance}`));

    const vehicle_data = []

    // continue to append data until all graphql queries are completed
    while (true) {
        const resp = await page.waitForResponse(async (response) =>
            response.url() === graphql_url &&
            response.status() === 200 &&
            (await response.json())?.data?.locateVehiclesByZip?.pagination
        );

        const {
            pagination: {
                pageNo: curr_page, 
                totalPages: total_pages,
            },
            vehicleSummary: data_to_append,
        } = (await resp.json()).data.locateVehiclesByZip

        console.log(`Reading response ${curr_page}/${total_pages}: [${data_to_append.length} entries]`);
        vehicle_data.push(...data_to_append)

        if (curr_page && total_pages && curr_page === total_pages) {
            break;
        }
    }

    fs.writeFile(dest_path, JSON.stringify(vehicle_data), (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log(`wrote inventory data to: ${filename}`)
        }
    })
}

/**
 * "main" async function call 
 * - mostly puppeteer scaffolding w/ minor configurations
 * - catches errors
 * - defers a final close on the browser if it still exists
 */
async function main() {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'ws://localhost:3000',
  });
  const page = await browser.newPage();
  script(page)
    .catch((err) => console.log(err))
    .finally(() => browser?.close());
}

// import location info from config.json
const require = createRequire(import.meta.url)
const {
    model: model,
    zipcode: zipcode,
    radius: distance
} = require('./config.json')

// run puppeteer script
main()
