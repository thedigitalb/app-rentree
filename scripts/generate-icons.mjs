// Génère les icônes PWA (PNG) à partir des SVG source du mascot HB.
// Usage : node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "src/assets");
const outDir = path.join(root, "public/icons");

mkdirSync(outDir, { recursive: true });

const jobs = [
  { input: "hb-icon.svg", output: "icon-192.png", size: 192 },
  { input: "hb-icon.svg", output: "icon-512.png", size: 512 },
  { input: "hb-icon.svg", output: "apple-touch-icon.png", size: 180 },
  { input: "hb-icon.svg", output: "favicon-32.png", size: 32 },
  { input: "hb-icon.svg", output: "favicon-16.png", size: 16 },
  { input: "hb-icon-maskable.svg", output: "icon-maskable-192.png", size: 192 },
  { input: "hb-icon-maskable.svg", output: "icon-maskable-512.png", size: 512 },
];

for (const job of jobs) {
  const inputPath = path.join(src, job.input);
  const outputPath = path.join(outDir, job.output);
  await sharp(inputPath, { density: 384 })
    .resize(job.size, job.size)
    .png()
    .toFile(outputPath);
  console.log(`✓ ${job.output}`);
}

console.log("Icônes générées dans public/icons/");
