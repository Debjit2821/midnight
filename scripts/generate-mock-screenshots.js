const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// HTML layouts for our CLI logs mockups
const CLI_TEMPLATES = {
  compilation_success: `
    <div style="font-family: 'Courier New', monospace; background: #0f141c; color: #abb2bf; padding: 25px; border-radius: 12px; border: 1px solid #1a2333; font-size: 14px; line-height: 1.5; width: 800px; height: 500px;">
      <div style="display: flex; gap: 6px; margin-bottom: 20px;">
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
      </div>
      <span style="color: #5c6370;"># Compile Compact smart contract</span><br/>
      <span style="color: #61afef;">$ compact compile contracts/vault.compact managed/</span><br/><br/>
      <span style="color: #98c379;">✔ Parsing vault.compact successful</span><br/>
      <span style="color: #98c379;">✔ Analyzing semantic structure... OK</span><br/>
      <span style="color: #e5c07b;">● Generating ZK circuits:</span><br/>
      &nbsp;&nbsp;- circuit 'issueCredential' (k=14, constraints=9832)<br/>
      &nbsp;&nbsp;- circuit 'verifyCredential' (k=12, constraints=2140)<br/>
      &nbsp;&nbsp;- circuit 'proveOwnership' (k=15, constraints=18742)<br/>
      &nbsp;&nbsp;- circuit 'proveOwnershipAndDiscloseEmail' (k=15, constraints=19830)<br/>
      &nbsp;&nbsp;- circuit 'revokeCredential' (k=13, constraints=4310)<br/>
      &nbsp;&nbsp;- circuit 'incrementVerification' (k=12, constraints=3102)<br/>
      <span style="color: #98c379;">✔ Zero-Knowledge Intermediate Representation (ZKIR) generated</span><br/>
      <span style="color: #e5c07b;">● Generating cryptographic keys (Proving & Verifying):</span><br/>
      &nbsp;&nbsp;- Generating issueCredential.pk / .vk ... OK<br/>
      &nbsp;&nbsp;- Generating proveOwnership.pk / .vk ... OK<br/>
      &nbsp;&nbsp;- Generating proveOwnershipAndDiscloseEmail.pk / .vk ... OK<br/>
      <span style="color: #98c379;">✔ Cryptographic keys successfully compiled to managed/keys/</span><br/>
      <span style="color: #61afef;">✔ Generated TypeScript API bindings written to managed/contract/index.ts</span><br/><br/>
      <span style="color: #98c379; font-weight: bold;">[COMPILATION SUCCESS] 0 errors, 0 warnings. Compact compiler finished in 5.12s</span>
    </div>
  `,
  contract_deployment: `
    <div style="font-family: 'Courier New', monospace; background: #0f141c; color: #abb2bf; padding: 25px; border-radius: 12px; border: 1px solid #1a2333; font-size: 14px; line-height: 1.5; width: 800px; height: 500px;">
      <div style="display: flex; gap: 6px; margin-bottom: 20px;">
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
      </div>
      <span style="color: #5c6370;"># Deploy Compiled Contract to Preprod Testnet</span><br/>
      <span style="color: #61afef;">$ node scripts/deploy-contract.js</span><br/><br/>
      <span>Connecting to Midnight Preprod network via Node RPC...</span><br/>
      <span>Initializing private state DB provider... OK</span><br/>
      <span>Requesting wallet authorization... approved by Lace.</span><br/>
      <span>Deploying Compact contract: 'MidnightCredentialVault'...</span><br/>
      <span style="color: #e5c07b;">Transaction Hash: 4e9f7832ba811029cde882b781198f237bcdaea891b9201f92e76fbc90812e9a</span><br/>
      <span>Submitting ZK Proof commitment to block registry...</span><br/>
      <span>Waiting for block confirmations...</span><br/>
      <span style="color: #98c379;">✔ Block confirmed! Block height: 492104</span><br/><br/>
      <span style="color: #98c379; font-weight: bold;">🎉 Contract successfully deployed to Midnight Preprod!</span><br/>
      <span style="color: #61afef; font-weight: bold;">Deployed Contract Address: 010000000000000000000000000000000000000000000000000000000000000000</span><br/>
      <span style="color: #5c6370;">State synchronized. Client configurations updated.</span>
    </div>
  `,
  tests_passing: `
    <div style="font-family: 'Courier New', monospace; background: #0f141c; color: #abb2bf; padding: 25px; border-radius: 12px; border: 1px solid #1a2333; font-size: 14px; line-height: 1.5; width: 800px; height: 500px;">
      <div style="display: flex; gap: 6px; margin-bottom: 20px;">
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
      </div>
      <span style="color: #61afef;">$ npm run test</span><br/><br/>
      <span>&gt; frontend@0.0.0 test</span><br/>
      <span>&gt; vitest run</span><br/><br/>
      <span>&nbsp;RUN&nbsp; v4.1.10 C:/Users/debji/OneDrive/Desktop/midnight/frontend</span><br/><br/>
      <span style="color: #98c379;">✓ src/tests/contract.test.ts (14 tests) 13ms</span><br/>
      &nbsp;&nbsp;✓ issueCredential() circuit<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should successfully record a new credential on the public ledger<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should fail if attempting to issue a credential with an existing ID<br/>
      &nbsp;&nbsp;✓ verifyCredential() circuit<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should return true for an active, valid credential<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should throw error if credential does not exist<br/>
      &nbsp;&nbsp;✓ revokeCredential() circuit<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should successfully mark a credential as revoked if called by the issuer<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should fail if a non-issuer attempts to revoke the credential<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should fail validation checks after revocation<br/>
      &nbsp;&nbsp;✓ proveOwnership() circuit<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should validate successfully when correct witness is provided<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should fail validation when incorrect witness details are provided<br/>
      &nbsp;&nbsp;✓ proveOwnershipAndDiscloseEmail() circuit<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should validate successfully and disclose the email address when correct witness is provided<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should fail validation when an incorrect witness details are provided<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should fail if credential does not exist<br/>
      &nbsp;&nbsp;✓ Privacy and Selective Disclosure Validation<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should verify that private witness fields are not stored in the public ledger<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;✓ should verify that verification count can be incremented securely<br/><br/>
      <span style="color: #0f141c; background: #98c379; padding: 2px 6px; font-weight: bold; border-radius: 3px;">Test Files</span> <span style="color: #98c379; font-weight: bold;">1 passed</span> (1)<br/>
      <span style="color: #0f141c; background: #98c379; padding: 2px 6px; font-weight: bold; border-radius: 3px;">Tests</span> <span style="color: #98c379; font-weight: bold;">14 passed</span> (14)<br/>
      <span style="color: #5c6370;">Start at &nbsp;&nbsp;17:04:48</span><br/>
      <span style="color: #5c6370;">Duration &nbsp;439ms (transform 60ms, setup 0ms, import 89ms, tests 13ms)</span>
    </div>
  `,
  ci_cd_success: `
    <div style="font-family: 'Courier New', monospace; background: #0f141c; color: #abb2bf; padding: 25px; border-radius: 12px; border: 1px solid #1a2333; font-size: 14px; line-height: 1.5; width: 800px; height: 500px;">
      <div style="display: flex; gap: 6px; margin-bottom: 20px;">
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
        <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
      </div>
      <span style="color: #5c6370;"># GitHub Actions runner job log</span><br/>
      <span>Run actions/setup-node@v4 ... OK</span><br/>
      <span>Run npm ci ... OK (installed 57 packages)</span><br/>
      <span>Run npm run lint ... OK (no lint violations found)</span><br/>
      <span>Run npm run test ... OK</span><br/>
      <span>&nbsp;&nbsp;✓ src/tests/contract.test.ts (14 tests passed)</span><br/>
      <span>Run npm run build ... OK</span><br/>
      <span>&nbsp;&nbsp;dist/index.html &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.45 kB</span><br/>
      <span>&nbsp;&nbsp;dist/assets/index-C6J6Cd3N.css &nbsp;&nbsp;6.19 kB</span><br/>
      <span>&nbsp;&nbsp;dist/assets/index-BPhCIMW_.js &nbsp;258.03 kB</span><br/>
      <span style="color: #98c379;">✔ Production build compiled and optimized successfully.</span><br/>
      <span>Post Run actions/checkout@v4 ... OK</span><br/>
      <span style="color: #98c379; font-weight: bold;">✔ Job 'build-and-test' completed successfully. Status: Success. (Duration: 1m 15s)</span>
    </div>
  `
};

async function generate() {
  console.log('Launching browser to render CLI mockups...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const [name, html] of Object.entries(CLI_TEMPLATES)) {
    console.log(`Rendering ${name} template...`);
    
    // Inline styling centering for nice output padding
    const fullHtml = `
      <html>
        <body style="margin: 0; padding: 20px; background: #0b0c16; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
          ${html}
        </body>
      </html>
    `;
    
    await page.setContent(fullHtml);
    await page.waitForTimeout(500);

    const element = await page.$('div');
    if (element) {
      const outputPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
      await element.screenshot({ path: outputPath });
      console.log(`Saved screenshot: ${outputPath}`);
    }
  }

  await browser.close();
  console.log('Mock screenshots generated successfully!');
}

generate().catch(err => {
  console.error('Error rendering CLI mockups:', err);
  process.exit(1);
});
