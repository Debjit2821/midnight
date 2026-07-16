const { chromium } = require('playwright');
const path = require('path');

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to explorer homepage...");
    await page.goto('https://explorer.preprod.midnight.network');
    
    console.log("Waiting for search bar...");
    const searchInputSelector = 'input[placeholder*="search" i], input[type="text"]';
    await page.waitForSelector(searchInputSelector);
    
    console.log("Typing wallet address hex...");
    const walletHex = 'mn_addr_preprod1l8aq3n0mv6g8zpztycw0xznhxg0ux4wpxctrry4dwy36zcprnhzs53a8js';
    await page.fill(searchInputSelector, walletHex);
    
    console.log("Clicking search icon...");
    const searchButton = page.locator('button:has(svg), svg').first();
    await searchButton.click();
    
    console.log("Waiting for navigation/results...");
    await page.waitForTimeout(6000);
    
    console.log(`Final URL: ${page.url()}`);
    
    const screenshotPath = path.join(__dirname, 'explorer-wallet.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to: ${screenshotPath}`);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("Page Text Snippet:");
    console.log(bodyText.substring(0, 1000));

  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await browser.close();
  }
}

run();
