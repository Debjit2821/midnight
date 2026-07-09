const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const URL = 'https://frontend-eosin-six-66.vercel.app';
const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle' });

  // 1. Capture Home Page (Running Frontend)
  console.log('Capturing Home page...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'running_frontend.png') });

  // 2. Connect Wallet Simulation
  console.log('Connecting Wallet...');
  await page.click('button:has-text("Connect Lace Wallet")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'wallet_connected.png') });

  // 3. Issue Credential
  console.log('Navigating to Issuer Portal...');
  await page.click('button:has-text("Issuer Portal")');
  await page.waitForTimeout(500);

  // Fill in Issuer Form
  await page.fill('input[name="id"]', '1042');
  await page.fill('input[name="ownerName"]', 'Alice Vance');
  await page.fill('input[name="email"]', 'alice@university.edu');
  await page.fill('input[name="studentID"]', 'STU-1042');
  await page.fill('input[name="dateOfBirth"]', '1998-05-15');
  
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'credential_issued.png') });

  console.log('Submitting credential...');
  await page.click('button:has-text("Issue Credential to Ledger")');
  // Wait for proof generation loader to finish
  await page.waitForSelector('.loading-overlay', { state: 'detached', timeout: 5000 });
  console.log('Credential issued!');

  // 4. Generate ZK Proof on Dashboard
  console.log('Navigating to Dashboard...');
  await page.click('button:has-text("Dashboard")');
  await page.waitForTimeout(1000);
  
  console.log('Generating Zero-Knowledge Proof...');
  await page.click('button:has-text("Generate Zero-Knowledge Proof")');
  // Wait for ZK Prover loader to finish
  await page.waitForSelector('.loading-overlay', { state: 'detached', timeout: 10000 });
  await page.waitForTimeout(500);
  
  // Take screenshot showing the generated ZK proof signature box
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'privacy_demonstration.png') });

  // Extract the generated ZK proof text to use it in verification
  const proofText = await page.textContent('pre');
  console.log('Extracted ZK Proof:', proofText.substring(0, 30) + '...');

  // 5. Verify Credential and Privacy Audit list
  console.log('Navigating to Verification Portal...');
  await page.click('button:has-text("Verification")');
  await page.waitForTimeout(500);

  await page.fill('input[name="id"]', '1042');
  await page.fill('textarea', proofText);
  
  console.log('Submitting proof for verification...');
  await page.click('button:has-text("Verify Credential validity")');
  // Wait for verification loader
  await page.waitForSelector('.loading-overlay', { state: 'detached', timeout: 5000 });
  await page.waitForTimeout(1000);

  // Take screenshot showing successful verification and the privacy audit checklist
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'credential_verified.png') });
  console.log('Verification captured successfully!');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
