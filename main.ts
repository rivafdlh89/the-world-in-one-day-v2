// News-image entry v2: copy the bundled front page to the output directory.
// The image is the whole entry; the program only moves it, so both runs
// write exactly the same bytes. Deterministic by construction: no date,
// no random value and no network is read anywhere in this program.
// Node 22, standard library only, no network.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
copyFileSync(join(here, "entry.png"), join(outDir, "entry.png"));
