const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\debji\\.gemini\\antigravity-ide\\brain\\1d264cac-55e1-4f10-b49d-a360592e3c3b\\.system_generated\\steps\\511\\content.md';

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Search for Bech32m addresses
  const contractRegex = /mn_contract_preprod[a-zA-Z0-9]+/g;
  const addressRegex = /mn_addr_preprod[a-zA-Z0-9]+/g;
  const hexAddressRegex = /0x[a-fA-F0-9]{40}/g;
  
  const contracts = content.match(contractRegex) || [];
  const addresses = content.match(addressRegex) || [];
  const hexAddresses = content.match(hexAddressRegex) || [];
  
  console.log("Found Contracts:");
  console.log([...new Set(contracts)]);
  
  console.log("\nFound Unshielded Addresses:");
  console.log([...new Set(addresses)]);

  console.log("\nFound Hex Addresses:");
  console.log([...new Set(hexAddresses)]);
} else {
  console.error("File not found:", filePath);
}
