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
    
    console.log("Typing transaction hash...");
    const txHash = '0a26703bf33e62e7bedae08d6376432da34a93873779e50be2c058a412e92450';
    await page.fill(searchInputSelector, txHash);
    
    // Find and click the search button (the magnifying glass icon)
    console.log("Clicking search icon...");
    // It's the parent button or sibling svg/button
    const searchButton = page.locator('button:has(svg), svg').first();
    await searchButton.click();
    
    console.log("Waiting for navigation/results...");
    await page.waitForTimeout(6000);
    
    console.log(`Final URL: ${page.url()}`);
    
    const screenshotPath = path.join(__dirname, 'explorer-tx.png');
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
