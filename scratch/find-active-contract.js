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
  console.log(`Scanning backwards from block height ${height} for active contracts...`);
  const contractCalls = {};
  
  for (let i = 0; i < 1500; i++) {
    const currentHeight = height - i;
    try {
      const block = await queryBlock(currentHeight);
      if (block && block.transactions && block.transactions.length > 0) {
        block.transactions.forEach(tx => {
          if (tx.contractActions && tx.contractActions.length > 0) {
            tx.contractActions.forEach(action => {
              if (action.address) {
                if (!contractCalls[action.address]) {
                  contractCalls[action.address] = {
                    deploys: 0,
                    calls: 0,
                    txs: []
                  };
                }
                if (action.__typename === 'ContractDeploy') {
                  contractCalls[action.address].deploys++;
                } else if (action.__typename === 'ContractCall') {
                  contractCalls[action.address].calls++;
                }
                contractCalls[action.address].txs.push(tx.hash);
              }
            });
          }
        });
      }
    } catch (e) {
      // Ignore block errors
    }
  }

  console.log("\nScan complete. Active Contract Addresses found:");
  Object.keys(contractCalls).forEach(addr => {
    const info = contractCalls[addr];
    console.log(`\nAddress: ${addr}`);
    console.log(`- Deploys: ${info.deploys}`);
    console.log(`- Calls: ${info.calls}`);
    console.log(`- Total Actions: ${info.deploys + info.calls}`);
    console.log(`- Example Tx: ${info.txs[0]}`);
  });
}

find();
