const http = require('https');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'midnight-preprod.api.subscan.io',
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Mozilla/5.0'
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          reject(new Error(`Failed to parse: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log("Querying Subscan Preprod API...");
  try {
    // Query recent extrinsics (transactions)
    const result = await post('/api/scan/extrinsics', {
      row: 10,
      page: 0
    });
    console.log("Subscan Recent Extrinsics:");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Query failed:", e.message);
  }
}

run();
