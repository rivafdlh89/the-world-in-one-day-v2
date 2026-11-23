// News-image entry v2: copy the bundled front page to the output directory,
// then verify the written file before exiting.
// The image is the whole entry; the program only moves it, so both runs
// write exactly the same bytes. Deterministic by construction: no date,
// no random value and no network is read anywhere in this program.
// Node 22, standard library only, no network.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const src = join(here, "entry.png");
const dst = join(outDir, "entry.png");

mkdirSync(outDir, { recursive: true });
copyFileSync(src, dst);

// Verify the output: valid PNG, 1024x1024, at most 1 MiB, byte-identical
// to the bundled image. Any mismatch fails the run loudly instead of
// silently producing a broken entry.
const srcBytes = readFileSync(src);
const outBytes = readFileSync(dst);
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
if (!outBytes.equals(srcBytes)) {
  throw new Error("output differs from bundled entry.png");
}
if (statSync(dst).size > 1024 * 1024) {
  throw new Error(`entry.png exceeds 1 MiB: ${statSync(dst).size} bytes`);
}
// PNG signature (8 bytes) + IHDR chunk: width and height are big-endian
// uint32 at offsets 16 and 20.
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!outBytes.subarray(0, 8).equals(PNG_SIG)) {
  throw new Error("entry.png is not a valid PNG");
}
const width = outBytes.readUInt32BE(16);
const height = outBytes.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png must be 1024x1024, got ${width}x${height}`);
}
console.log(`entry.png verified: 1024x1024, ${outBytes.length} bytes, sha256 ${sha256(outBytes)}`);
