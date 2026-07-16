const http = require('https');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'midnight-preprod.webapi.subscan.io',
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
  console.log("Querying Subscan Web API...");
  try {
    const result = await post('/api/v2/scan/contracts', {
      row: 10,
      page: 0
    });
    console.log("Contracts List Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Contracts query failed:", e.message);
  }

  try {
    const result = await post('/api/v2/scan/extrinsics', {
      row: 10,
      page: 0
    });
    console.log("\nExtrinsics List Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Extrinsics query failed:", e.message);
  }
}

run();
