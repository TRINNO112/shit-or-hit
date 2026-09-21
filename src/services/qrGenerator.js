/**
 * ⚡ Ultra-Lightweight Pure-JS QR Code SVG Generator (Zero Dependencies)
 * Implements ISO/IEC 18004 QR code matrix generation for compact URLs and pairing codes.
 */

// QR Code Type 1-4 generator tables and Reed-Solomon polynomial math
const PAD0 = 0xec;
const PAD1 = 0x11;

function createBuffer() {
  const buffer = [];
  let length = 0;
  return {
    get(i) { return ((buffer[Math.floor(i / 8)] >>> (7 - (i % 8))) & 1) === 1; },
    put(num, len) {
      for (let i = 0; i < len; i++) {
        this.putBit(((num >>> (len - i - 1)) & 1) === 1);
      }
    },
    putBit(bit) {
      const bufIdx = Math.floor(length / 8);
      if (buffer.length <= bufIdx) buffer.push(0);
      if (bit) buffer[bufIdx] |= (0x80 >>> (length % 8));
      length++;
    },
    getLengthInBits() { return length; }
  };
}

// GF(256) Log / Exp Tables
const EXP_TABLE = new Array(256);
const LOG_TABLE = new Array(256);
for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) {
  EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) LOG_TABLE[EXP_TABLE[i]] = i;

function gmult(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
}

function rsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = [1, EXP_TABLE[i]];
    const res = new Array(poly.length + next.length - 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      for (let k = 0; k < next.length; k++) {
        res[j + k] ^= gmult(poly[j], next[k]);
      }
    }
    poly = res;
  }
  return poly;
}

function calculateEC(data, ecCount) {
  const poly = rsGeneratorPoly(ecCount);
  const info = data.slice().concat(new Array(ecCount).fill(0));
  for (let i = 0; i < data.length; i++) {
    const coef = info[i];
    if (coef !== 0) {
      for (let j = 0; j < poly.length; j++) {
        info[i + j] ^= gmult(poly[j], coef);
      }
    }
  }
  return info.slice(data.length);
}

/**
 * Generates an SVG path string or 2D boolean module matrix for a text payload
 */
export function generateQRCodeMatrix(text) {
  // Determine version needed (1 = 21x21, 2 = 25x25, 3 = 29x29, 4 = 33x33)
  const bytes = new TextEncoder().encode(text);
  const len = bytes.length;
  
  let typeNumber = 1;
  let totalDataBytes = 19;
  let ecBytes = 7;
  
  if (len <= 14) {
    typeNumber = 1; totalDataBytes = 19; ecBytes = 7;
  } else if (len <= 26) {
    typeNumber = 2; totalDataBytes = 34; ecBytes = 10;
  } else if (len <= 42) {
    typeNumber = 3; totalDataBytes = 55; ecBytes = 15;
  } else {
    typeNumber = 4; totalDataBytes = 80; ecBytes = 20;
  }

  const moduleCount = typeNumber * 4 + 17;
  const modules = Array.from({ length: moduleCount }, () => new Array(moduleCount).fill(null));

  // Function patterns: Finder Patterns (top-left, top-right, bottom-left)
  function setupFinder(r, c) {
    for (let row = -1; row <= 7; row++) {
      for (let col = -1; col <= 7; col++) {
        if (r + row < 0 || r + row >= moduleCount || c + col < 0 || c + col >= moduleCount) continue;
        if ((row >= 0 && row <= 6 && (col === 0 || col === 6)) ||
            (col >= 0 && col <= 6 && (row === 0 || row === 6)) ||
            (row >= 2 && row <= 4 && col >= 2 && col <= 4)) {
          modules[r + row][c + col] = true;
        } else {
          modules[r + row][c + col] = false;
        }
      }
    }
  }

  setupFinder(0, 0);
  setupFinder(0, moduleCount - 7);
  setupFinder(moduleCount - 7, 0);

  // Timing patterns
  for (let r = 8; r < moduleCount - 8; r++) {
    if (modules[r][6] === null) modules[r][6] = (r % 2 === 0);
  }
  for (let c = 8; c < moduleCount - 8; c++) {
    if (modules[6][c] === null) modules[6][c] = (c % 2 === 0);
  }

  // Alignment pattern for version >= 2
  if (typeNumber >= 2) {
    const pos = moduleCount - 7;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        modules[pos + r][pos + c] = (Math.max(Math.abs(r), Math.abs(c)) !== 1);
      }
    }
  }

  // Dark module
  modules[4 * typeNumber + 9][8] = true;

  // Encode byte payload in 8-bit mode (0100)
  const bitBuf = createBuffer();
  bitBuf.put(4, 4); // Byte mode indicator
  bitBuf.put(len, 8); // Character count
  for (let i = 0; i < len; i++) {
    bitBuf.put(bytes[i], 8);
  }

  // Terminator
  while (bitBuf.getLengthInBits() % 8 !== 0) bitBuf.putBit(false);
  const dataBytesCount = totalDataBytes - ecBytes;
  while (bitBuf.getLengthInBits() < dataBytesCount * 8) {
    bitBuf.put(PAD0, 8);
    if (bitBuf.getLengthInBits() < dataBytesCount * 8) bitBuf.put(PAD1, 8);
  }

  // Extract raw data bytes
  const dataBytes = [];
  for (let i = 0; i < dataBytesCount; i++) {
    let b = 0;
    for (let bit = 0; bit < 8; bit++) {
      if (bitBuf.get(i * 8 + bit)) b |= (0x80 >>> bit);
    }
    dataBytes.push(b);
  }

  // Compute Reed-Solomon EC bytes
  const ec = calculateEC(dataBytes, ecBytes);
  const finalSequence = dataBytes.concat(ec);

  // Interleave and place bits into matrix with standard pattern masking (Mask Pattern 0: (row + col) % 2 == 0)
  let bitIndex = 0;
  const totalBits = finalSequence.length * 8;
  const getNextBit = () => {
    if (bitIndex >= totalBits) return false;
    const byte = finalSequence[Math.floor(bitIndex / 8)];
    const bit = (byte >>> (7 - (bitIndex % 8))) & 1;
    bitIndex++;
    return bit === 1;
  };

  let dir = -1;
  for (let col = moduleCount - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing column
    const rows = [];
    if (dir === -1) {
      for (let r = moduleCount - 1; r >= 0; r--) rows.push(r);
    } else {
      for (let r = 0; r < moduleCount; r++) rows.push(r);
    }

    for (const row of rows) {
      for (let c = 0; c < 2; c++) {
        const cCol = col - c;
        if (modules[row][cCol] === null) {
          const rawBit = getNextBit();
          const mask = ((row + cCol) % 2 === 0);
          modules[row][cCol] = rawBit ^ mask;
        }
      }
    }
    dir = -dir;
  }

  // Format Information (Mask 0 + Error Level M)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 15; i++) {
    const bit = formatBits[i] === 1;
    // Top-left
    if (i <= 5) modules[8][i] = bit;
    else if (i === 6) modules[8][7] = bit;
    else if (i === 7) modules[8][8] = bit;
    else if (i === 8) modules[7][8] = bit;
    else modules[14 - i][8] = bit;

    // Right / bottom split
    if (i < 8) modules[8][moduleCount - 1 - i] = bit;
    else modules[moduleCount - 15 + i][8] = bit;
  }

  return modules;
}

/**
 * Generates an SVG string representation of the QR code
 */
export function generateQRCodeSVG(text, size = 220) {
  const matrix = generateQRCodeMatrix(text);
  const n = matrix.length;
  const cellSize = (size / n).toFixed(2);

  let paths = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        const x = (c * cellSize).toFixed(2);
        const y = (r * cellSize).toFixed(2);
        paths += `M${x},${y}h${cellSize}v${cellSize}h-${cellSize}z `;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="100%" height="100%" fill="#FFFDF8"/>
      <path d="${paths}" fill="#000000" shape-rendering="crispEdges"/>
    </svg>
  `.trim();
}
