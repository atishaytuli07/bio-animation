/**
 * Generates the site favicon — a minimal DNA mark on the hero-act indigo.
 * Writes public/favicon.svg (crisp, modern browsers) and public/favicon.ico
 * (32×32 BMP-in-ICO, the universal fallback). Run: node scripts/make-favicon.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
mkdirSync(pub, { recursive: true });

// Palette (sRGB approximations of the story tokens)
const BG = [0x3b, 0x37, 0x86]; // act-hero indigo
const STRAND = [0xf5, 0xf2, 0xff]; // ink
const SIGNAL = [0xe0, 0x3a, 0x3e]; // variant red

/* ---------------------------------------------------------------- SVG */

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="rgb(${BG.join(",")})"/>
  <g stroke="rgb(${STRAND.join(",")})" stroke-width="2.1" stroke-linecap="round" fill="none">
    <path d="M11 5 C21 9.5 21 13 11 17 C21 21 21 24.5 11 27"/>
    <path d="M21 5 C11 9.5 11 13 21 17 C11 21 11 24.5 21 27"/>
  </g>
  <g stroke="rgb(${STRAND.join(",")})" stroke-width="1.5" opacity="0.65">
    <line x1="13.2" y1="8.2" x2="18.8" y2="8.2"/>
    <line x1="12.6" y1="23.8" x2="19.4" y2="23.8"/>
  </g>
  <circle cx="16" cy="16" r="3" fill="rgb(${SIGNAL.join(",")})"/>
</svg>
`;
writeFileSync(join(pub, "favicon.svg"), svg);

/* ------------------------------------------------------- ICO (32×32) */

const W = 32;
const px = new Uint8Array(W * W * 4); // RGBA, top-down while we draw

const put = (x, y, [r, g, b], a = 255) => {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= W) return;
  const i = (y * W + x) * 4;
  px[i] = r;
  px[i + 1] = g;
  px[i + 2] = b;
  px[i + 3] = a;
};

// rounded-square background
const R = 7;
for (let y = 0; y < W; y++) {
  for (let x = 0; x < W; x++) {
    const cx = x < R ? R : x >= W - R ? W - 1 - R : x;
    const cy = y < R ? R : y >= W - R ? W - 1 - R : y;
    const inside = (x - cx) ** 2 + (y - cy) ** 2 <= R * R;
    if (inside) put(x, y, BG);
  }
}

// two strands: sine curves crossing 1.5 turns
const blob = (x, y, c) => {
  for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) put(x + dx, y + dy, c);
};
for (let yy = 5; yy <= 27; yy += 0.5) {
  const t = (yy - 5) / 22;
  const ph = t * Math.PI * 3;
  const off = 5.4 * Math.sin(ph);
  blob(15 + off - 0.5, yy, STRAND);
  blob(15 - off - 0.5, yy, STRAND);
}
// rungs at the two widest points
for (let x = 11; x <= 20; x++) {
  put(x, 8, STRAND, 180);
  put(x, 24, STRAND, 180);
}
// the variant, dead centre where the strands cross
for (let dy = -1; dy <= 2; dy++) for (let dx = -1; dx <= 2; dx++) put(15 + dx, 15 + dy, SIGNAL);

// ---- pack as BMP-in-ICO ----
const rowSize = W * 4;
const xorSize = rowSize * W;
const andSize = (W / 8) * W; // 1bpp mask
const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0); // biSize
bmpHeader.writeInt32LE(W, 4); // width
bmpHeader.writeInt32LE(W * 2, 8); // height (XOR + AND)
bmpHeader.writeUInt16LE(1, 12); // planes
bmpHeader.writeUInt16LE(32, 14); // bpp
bmpHeader.writeUInt32LE(xorSize + andSize, 20);

const xor = Buffer.alloc(xorSize);
for (let y = 0; y < W; y++) {
  for (let x = 0; x < W; x++) {
    const s = (y * W + x) * 4;
    const d = ((W - 1 - y) * W + x) * 4; // bottom-up
    xor[d] = px[s + 2]; // B
    xor[d + 1] = px[s + 1]; // G
    xor[d + 2] = px[s]; // R
    xor[d + 3] = px[s + 3]; // A
  }
}
const and = Buffer.alloc(andSize); // all opaque handled by alpha channel

const image = Buffer.concat([bmpHeader, xor, and]);
const ico = Buffer.alloc(6 + 16);
ico.writeUInt16LE(0, 0); // reserved
ico.writeUInt16LE(1, 2); // type: icon
ico.writeUInt16LE(1, 4); // count
ico.writeUInt8(W, 6); // width
ico.writeUInt8(W, 7); // height
ico.writeUInt8(0, 8); // palette
ico.writeUInt8(0, 9); // reserved
ico.writeUInt16LE(1, 10); // planes
ico.writeUInt16LE(32, 12); // bpp
ico.writeUInt32LE(image.length, 14); // bytes
ico.writeUInt32LE(22, 18); // offset

writeFileSync(join(pub, "favicon.ico"), Buffer.concat([ico, image]));
console.log("wrote public/favicon.svg and public/favicon.ico");
