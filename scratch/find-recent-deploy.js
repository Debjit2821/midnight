const http = require('https');

function queryBlock(height) {
  return new Promise((resolve, reject) => {
    const query = JSON.stringify({
      query: `
        query {
          block(offset: { height: ${height} }) {
            height
            hash
            transactions {
              hash
              contractActions {
                __typename
                address
              }
            }
          }
        }
      `
    });

    const options = {
      hostname: 'indexer.preprod.midnight.network',
      path: '/api/v4/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': query.length,
        'User-Agent': 'Node.js'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.data ? parsed.data.block : null);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(query);
    req.end();
  });
}

async function find() {
  let height = 1670889;
  console.log(`Scanning backwards from block height ${height} for ContractDeploy...`);
  // Scan up to 2000 blocks to find a contract deployment
  for (let i = 0; i < 2000; i++) {
    const currentHeight = height - i;
    if (i > 0 && i % 100 === 0) {
      console.log(`Scanned ${i} blocks...`);
    }
    try {
      const block = await queryBlock(currentHeight);
      if (block && block.transactions && block.transactions.length > 0) {
        let found = false;
        block.transactions.forEach(tx => {
          if (tx.contractActions && tx.contractActions.length > 0) {
            tx.contractActions.forEach(action => {
              if (action.__typename === 'ContractDeploy') {
                console.log(`\n🎉 Found ContractDeploy in block ${currentHeight}!`);
                console.log(`Tx Hash: ${tx.hash}`);
                console.log(`Contract Address: ${action.address}`);
                found = true;
              }
            });
          }
        });
        if (found) break;
      }
    } catch (e) {
      console.error(`Error querying block ${currentHeight}:`, e.message);
    }
  }
}

find();
