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
    
    console.log("Typing contract address...");
    const contractAddress = '013b477afdd03085630c0afca689ba0cd5fab475bcfd9e021f47e9c0e8699164ce';
    await page.fill(searchInputSelector, contractAddress);
    
    console.log("Waiting for dropdown suggestions to appear...");
    await page.waitForTimeout(3000);
    
    // Check if there is any suggestion element or listbox in the DOM
    const htmlSnippet = await page.evaluate(() => {
      return document.querySelector('header, div[role="listbox"], ul, div.absolute')?.innerHTML || 'No suggestion wrapper found';
    });
    console.log("HTML Snippet around suggestions:", htmlSnippet.substring(0, 1000));

    // Try pressing ArrowDown and Enter to select the first suggestion if it's standard combobox
    console.log("Pressing ArrowDown and Enter...");
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    
    console.log("Waiting for navigation/results...");
    await page.waitForTimeout(5000);
    
    console.log(`Final URL: ${page.url()}`);
    
    const screenshotPath = path.join(__dirname, 'explorer-dropdown.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to: ${screenshotPath}`);

  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await browser.close();
  }
}

run();
