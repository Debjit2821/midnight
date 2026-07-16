const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function decode(bechString) {
  const pos = bechString.lastIndexOf('1');
  if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
    throw new Error('Invalid bech32 address');
  }
  const hrp = bechString.substring(0, pos);
  const data = [];
  for (let p = pos + 1; p < bechString.length; ++p) {
    const d = CHARSET.indexOf(bechString.charAt(p));
    if (d === -1) throw new Error('Invalid character');
    data.push(d);
  }
  
  // Convert from 5-bit array to 8-bit array
  const words = data.slice(0, -6); // Remove checksum
  let nextByte = 0;
  let excessBits = 0;
  const bytes = [];
  for (const word of words) {
    if (excessBits < 3) {
      excessBits += 5;
      nextByte = (nextByte << 5) | word;
    } else {
      excessBits -= 3;
      bytes.push((nextByte << 5) | (word >> excessBits));
      nextByte = word & ((1 << excessBits) - 1);
    }
  }
  
  return {
    hrp,
    hex: Buffer.from(bytes).toString('hex')
  };
}

try {
  const addr = 'mn_addr_preprod1l8aq3n0mv6g8zpztycw0xznhxg0ux4wpxctrry4dwy36zcprnhzs53a8js';
  const result = decode(addr);
  console.log(`Address: ${addr}`);
  console.log(`HRP: ${result.hrp}`);
  console.log(`Decoded Hex Payload: ${result.hex}`);
} catch (e) {
  console.error("Decoding failed:", e.message);
}
