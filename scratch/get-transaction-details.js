const http = require('https');

const query = JSON.stringify({
  query: `
    query {
      block(offset: { height: 1670578 }) {
        transactions {
          hash
          unshieldedCreatedOutputs {
            owner
          }
          unshieldedSpentOutputs {
            owner
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
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error("Failed to parse response:", e.message);
    }
  });
});

req.on('error', (e) => {
  console.error("Request error:", e.message);
});

req.write(query);
req.end();
