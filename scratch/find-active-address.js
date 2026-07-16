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
  console.log(`Scanning backwards from block height ${height}...`);
  for (let i = 0; i < 200; i++) {
    const currentHeight = height - i;
    try {
      const block = await queryBlock(currentHeight);
      if (block && block.transactions && block.transactions.length > 0) {
        console.log(`\n🎉 Found transactions in block ${currentHeight}!`);
        block.transactions.forEach(tx => {
          console.log(`Tx Hash: ${tx.hash}`);
          if (tx.contractActions && tx.contractActions.length > 0) {
            tx.contractActions.forEach(action => {
              console.log(`   Contract Address: ${action.address}`);
            });
          }
        });
        break; // Stop once we find blocks with transactions
      }
    } catch (e) {
      console.error(`Error querying block ${currentHeight}:`, e.message);
    }
  }
}

find();
