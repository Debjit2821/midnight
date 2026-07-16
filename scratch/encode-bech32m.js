const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function polymod(values) {
  let generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (let p = 0; p < values.length; ++p) {
    let top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ values[p];
    for (let i = 0; i < 5; ++i) {
      if ((top >> i) & 1) {
        chk ^= generator[i];
      }
    }
  }
  return chk;
}

function hrpExpand(hrp) {
  let ret = [];
  for (let p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) >> 5);
  }
  ret.push(0);
  for (let p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) & 31);
  }
  return ret;
}

function encode(hrp, data) {
  let combined = hrpExpand(hrp).concat(data);
  const BECH32M_CONST = 0x2bc830a3;
  let chk = polymod(combined.concat([0, 0, 0, 0, 0, 0])) ^ BECH32M_CONST;
  let ret = hrp + '1';
  for (let p = 0; p < data.length; ++p) {
    ret += CHARSET.charAt(data[p]);
  }
  for (let p = 0; p < 6; ++p) {
    ret += CHARSET.charAt((chk >> ((5 - p) * 5)) & 31);
  }
  return ret;
}

function convertBits(data, frombits, tobits, pad) {
  let acc = 0;
  let bits = 0;
  let ret = [];
  let maxv = (1 << tobits) - 1;
  for (let p = 0; p < data.length; ++p) {
    let value = data[p];
    acc = (acc << frombits) | value;
    bits += frombits;
    while (bits >= tobits) {
      bits -= tobits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) {
      ret.push((acc << (tobits - bits)) & maxv);
    }
  } else if (bits >= frombits || ((acc << (tobits - bits)) & maxv)) {
    return null;
  }
  return ret;
}

try {
  const hex = '3a746a54c11ff61851381c631b4f4728c3c4d527160fa4bbc91eac023409973d';
  const bytes = Buffer.from(hex, 'hex');
  const words = convertBits(bytes, 8, 5, true);
  const encoded = encode('mn_contract_preprod', words);
  console.log(`Raw Hex: ${hex}`);
  console.log(`Bech32m Contract Address: ${encoded}`);
} catch (e) {
  console.error("Encoding failed:", e.message);
}
