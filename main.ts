// Entry program for the news-image-20261124 bounty (Node 22, standard library only).
// The front page is the entry.png file beside this program; this program copies it
// to the output directory as entry.png. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output, e.g. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX_BYTES = 1048576;
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'entry.png');
copyFileSync(source, outPath);

// Verify the written output before exiting: it must exist, fit the 1 MiB cap,
// be byte-identical to the source image, and carry the whole-file markers of
// a complete PNG (signature + IEND) or JPEG (SOI + EOI). Anything else is a
// broken entry, so fail loudly instead of handing in a bad file.
const written = readFileSync(outPath);
const original = readFileSync(source);
if (written.length > MAX_BYTES) {
  console.error(`error: entry.png is ${written.length} bytes, over the ${MAX_BYTES} byte cap`);
  process.exit(1);
}
if (!written.equals(original)) {
  console.error('error: entry.png differs from the source image');
  process.exit(1);
}
const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const pngIend = Buffer.from([0x49, 0x45, 0x4e, 0x44]);
const isPng = written.subarray(0, 8).equals(pngSig) && written.includes(pngIend);
const isJpeg = written[0] === 0xff && written[1] === 0xd8
  && written[written.length - 2] === 0xff && written[written.length - 1] === 0xd9;
if (!isPng && !isJpeg) {
  console.error('error: entry.png is neither a whole PNG nor a whole JPEG');
  process.exit(1);
}
console.log(`wrote ${outPath} (${written.length} bytes, ${isPng ? 'PNG' : 'JPEG'})`);
