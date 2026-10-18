import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { encodePng, compareImages } from '../../src/diff.js';

const EXAMPLE_DIR = path.resolve('examples/01-landing-page');

function fillRect(png, x, y, width, height, r, g, b, a = 255) {
  for (let cy = y; cy < y + height; cy++) {
    for (let cx = x; cx < x + width; cx++) {
      if (cx >= 0 && cx < png.width && cy >= 0 && cy < png.height) {
        const idx = (cy * png.width + cx) * 4;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

async function generateLandingPageImages() {
  await fs.promises.mkdir(EXAMPLE_DIR, { recursive: true });

  const width = 800;
  const height = 500;

  // 1. Reference Image
  const refPng = new PNG({ width, height });
  // Slate dark canvas (#0f172a)
  fillRect(refPng, 0, 0, width, height, 15, 23, 42);
  // Header bar (#1e293b), y: 0..56
  fillRect(refPng, 0, 0, width, 56, 30, 41, 59);
  // Header logo pill (#38bdf8), x: 32..96, y: 16..40
  fillRect(refPng, 32, 16, 64, 24, 56, 189, 248);
  // Nav links: 3 pills (#94a3b8), x: 540, 610, 680
  fillRect(refPng, 540, 22, 50, 12, 148, 163, 184);
  fillRect(refPng, 610, 22, 50, 12, 148, 163, 184);
  fillRect(refPng, 680, 22, 50, 12, 148, 163, 184);
  // Hero Badge pill (#0284c7), x: 48..200, y: 96..120
  fillRect(refPng, 48, 96, 152, 24, 2, 132, 199);
  // Hero Headline block (#f8fafc), x: 48..460, y: 136..176
  fillRect(refPng, 48, 136, 412, 40, 248, 250, 252);
  // Hero Subtitle block (#94a3b8), x: 48..400, y: 192..216
  fillRect(refPng, 48, 192, 352, 24, 148, 163, 184);
  // Primary CTA button (#2563eb - blue 600), x: 48..208, y: 248..296 (160x48px)
  fillRect(refPng, 48, 248, 160, 48, 37, 99, 235);
  // Secondary CTA button outline (#334155), x: 224..368, y: 248..296
  fillRect(refPng, 224, 248, 144, 48, 51, 65, 85);
  // Hero Visual Graphic box (#1e293b), x: 500..752, y: 96..380
  fillRect(refPng, 500, 96, 252, 284, 30, 41, 59);

  const refBuf = await encodePng(refPng);
  const refPath = path.join(EXAMPLE_DIR, 'reference-hero.png');
  await fs.promises.writeFile(refPath, refBuf);

  // 2. Candidate Rendered Image (with 1 subtle discrepancy: CTA rendered in indigo-600 #4f46e5 instead of blue-600 #2563eb)
  const renderedPng = new PNG({ width, height });
  refPng.data.copy(renderedPng.data);
  // Overwrite CTA with #4f46e5
  fillRect(renderedPng, 48, 248, 160, 48, 79, 70, 229);

  const renderedBuf = await encodePng(renderedPng);
  const renderedPath = path.join(EXAMPLE_DIR, 'rendered-hero.png');
  await fs.promises.writeFile(renderedPath, renderedBuf);

  // 3. Generate Visual Difference Image using compareImages
  const diffPath = path.join(EXAMPLE_DIR, 'diff-hero.png');
  const result = await compareImages(refPath, renderedPath, {
    threshold: 0.1,
    diffPath
  });

  console.log('Landing page example images generated:');
  console.log(`- Reference: ${refPath}`);
  console.log(`- Rendered:  ${renderedPath}`);
  console.log(`- Diff Image: ${diffPath}`);
  console.log(`- Mismatched Pixels: ${result.diffPixels} (${result.diffPercentage}%)`);
  console.log(`- Bounding Box:`, result.boundingBox);
}

generateLandingPageImages().catch(console.error);
