const { chromium } = require('playwright');
const path = require('path');

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    const url = 'https://explorer.preprod.midnight.network/contracts/3b477afdd03085630c0afca689ba0cd5fab475bcfd9e021f47e9c0e8699164ce';
    console.log(`Navigating directly to: ${url}`);
    await page.goto(url);
    
    console.log("Waiting for page content to render...");
    await page.waitForTimeout(6000);
    
    console.log(`Final URL: ${page.url()}`);
    
    const screenshotPath = path.join(__dirname, 'explorer-contract-direct.png');
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
