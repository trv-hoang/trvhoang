// Minimal PNG decoder (8-bit, non-interlaced; colour types 2, 3, 6), enough to
// inspect Hugo's generated share cards without an image library.
import { inflateSync } from 'node:zlib';

export function decodePng(buf) {
  let pos = 8, width, height, type, palette, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), kind = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (kind === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4); type = data[9];
      if (data[8] !== 8 || data[12] !== 0) throw new Error('unsupported PNG');
    } else if (kind === 'PLTE') palette = data;
    else if (kind === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = { 2: 3, 3: 1, 6: 4 }[type];
  if (!bpp) throw new Error(`unsupported colour type ${type}`);
  const raw = inflateSync(Buffer.concat(idat)), stride = width * bpp, px = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f];
      px[y * stride + x] = (src[x] + pred) & 0xff;
    }
  }
  const rgb = (x, y) => {
    const i = (y * width + x) * bpp;
    return type === 3 ? [palette[px[i] * 3], palette[px[i] * 3 + 1], palette[px[i] * 3 + 2]] : [px[i], px[i + 1], px[i + 2]];
  };
  return { width, height, rgb };
}

// Rows in [y0, y1) that hold any pixel differing from the background within [x0, x1).
export function inkRows(img, { x0, x1, y0, y1 }, bg = [0x1c, 0x19, 0x17]) {
  const rows = [];
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const [r, g, b] = img.rgb(x, y);
      if (Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]) > 24) { rows.push(y); break; }
    }
  return rows;
}

// Count separate horizontal bands of ink (one per text line).
export const bands = rows => rows.filter((y, i) => i === 0 || y !== rows[i - 1] + 1).length;
