const { chromium } = require('playwright');
const path = require('path');

async function run() {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to explorer homepage...");
    await page.goto('https://explorer.preprod.midnight.network');
    
    // Wait for search input to be visible
    console.log("Waiting for search bar...");
    await page.waitForSelector('input[placeholder*="search" i], input[type="text"]', { timeout: 15000 });
    
    // Type the contract address and press Enter
    console.log("Entering contract address...");
    const contractAddress = '013b477afdd03085630c0afca689ba0cd5fab475bcfd9e021f47e9c0e8699164ce';
    await page.fill('input[placeholder*="search" i], input[type="text"]', contractAddress);
    await page.keyboard.press('Enter');
    
    console.log("Waiting for search results...");
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`Current Page URL after search: ${currentUrl}`);
    
    // Save screenshot to scratch folder
    const screenshotPath = path.join(__dirname, 'explorer-search.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Get text content of the page body
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("Page Text Snippet:");
    console.log(bodyText.substring(0, 1000));
    
  } catch (error) {
    console.error("Browser test failed:", error.message);
  } finally {
    await browser.close();
  }
}

run();
