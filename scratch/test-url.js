const http = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      console.log(`URL: ${url}`);
      console.log(`Status Code: ${res.statusCode}`);
      resolve(res.statusCode);
    }).on('error', (e) => {
      console.error(`Error:`, e.message);
      resolve(null);
    });
  });
}

async function run() {
  await testUrl('https://explorer.preprod.midnight.network/contract/013b477afdd03085630c0afca689ba0cd5fab475bcfd9e021f47e9c0e8699164ce');
  await testUrl('https://explorer.preprod.midnight.network/contract/mn_contract_preprod18drh4lwsxzzkxrq2ljngnwsv6hatgadulk0qy868a8qws6v3vn8q84ppwl');
  await testUrl('https://midnight-preprod.subscan.io/contract/013b477afdd03085630c0afca689ba0cd5fab475bcfd9e021f47e9c0e8699164ce');
  await testUrl('https://midnight-preprod.subscan.io/contract/mn_contract_preprod18drh4lwsxzzkxrq2ljngnwsv6hatgadulk0qy868a8qws6v3vn8q84ppwl');
}

run();
