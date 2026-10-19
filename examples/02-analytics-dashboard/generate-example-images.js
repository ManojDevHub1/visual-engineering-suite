import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { encodePng, compareImages } from '../../src/diff.js';

const EXAMPLE_DIR = path.resolve('examples/02-analytics-dashboard');

function fillRect(png, x, y, width, height, r, g, b, a = 255) {
  for (let cy = Math.round(y); cy < Math.round(y + height); cy++) {
    for (let cx = Math.round(x); cx < Math.round(x + width); cx++) {
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

async function generateDashboardImages() {
  await fs.promises.mkdir(EXAMPLE_DIR, { recursive: true });

  const width = 900;
  const height = 600;

  // 1. Reference Image
  const refPng = new PNG({ width, height });
  // Main canvas background (#f8fafc)
  fillRect(refPng, 0, 0, width, height, 248, 250, 252);
  // Sidebar slate-900 (#0f172a), x: 0..200
  fillRect(refPng, 0, 0, 200, height, 15, 23, 42);
  // Sidebar logo (#38bdf8), x: 24..100, y: 24..48
  fillRect(refPng, 24, 24, 76, 24, 56, 189, 248);
  // Sidebar nav items (4 items, x: 24..176, y: 88, 136, 184, 232)
  fillRect(refPng, 24, 88, 152, 32, 30, 41, 59); // active item
  fillRect(refPng, 24, 136, 152, 32, 15, 23, 42);
  fillRect(refPng, 24, 184, 152, 32, 15, 23, 42);
  fillRect(refPng, 24, 232, 152, 32, 15, 23, 42);
  // Top header bar (#ffffff, y: 0..64, x: 200..900)
  fillRect(refPng, 200, 0, 700, 64, 255, 255, 255);
  // Header title (#0f172a, x: 232..400, y: 22..42)
  fillRect(refPng, 232, 22, 168, 20, 15, 23, 42);
  // Header date filter button (#e2e8f0, x: 740..868, y: 16..48)
  fillRect(refPng, 740, 16, 128, 32, 226, 232, 240);

  // 3 KPI Cards at y: 96..206 (height: 110px)
  // Card 1: x: 232..432 (w: 200)
  fillRect(refPng, 232, 96, 200, 110, 255, 255, 255);
  fillRect(refPng, 248, 112, 100, 14, 100, 116, 139);
  fillRect(refPng, 248, 140, 120, 28, 15, 23, 42);
  fillRect(refPng, 360, 172, 56, 20, 34, 197, 94);

  // Card 2: x: 452..652 (w: 200)
  fillRect(refPng, 452, 96, 200, 110, 255, 255, 255);
  fillRect(refPng, 468, 112, 100, 14, 100, 116, 139);
  fillRect(refPng, 468, 140, 110, 28, 15, 23, 42);
  fillRect(refPng, 580, 172, 56, 20, 59, 130, 246);

  // Card 3: x: 672..872 (w: 200)
  fillRect(refPng, 672, 96, 200, 110, 255, 255, 255);
  fillRect(refPng, 688, 112, 100, 14, 100, 116, 139);
  fillRect(refPng, 688, 140, 90, 28, 15, 23, 42);
  fillRect(refPng, 800, 172, 56, 20, 34, 197, 94);

  // Data table: x: 232..872 (w: 640), y: 236..560
  fillRect(refPng, 232, 236, 640, 324, 255, 255, 255);
  fillRect(refPng, 232, 236, 640, 44, 241, 245, 249);
  fillRect(refPng, 232, 324, 640, 1, 226, 232, 240);
  fillRect(refPng, 232, 380, 640, 1, 226, 232, 240);
  fillRect(refPng, 232, 436, 640, 1, 226, 232, 240);

  const refBuf = await encodePng(refPng);
  const refPath = path.join(EXAMPLE_DIR, 'reference-dashboard.png');
  await fs.promises.writeFile(refPath, refBuf);

  // 2. Candidate Rendered Image (Card 2 displaced down by 16px and missing trend badge)
  const renderedPng = new PNG({ width, height });
  refPng.data.copy(renderedPng.data);
  fillRect(renderedPng, 452, 96, 200, 130, 248, 250, 252);
  fillRect(renderedPng, 452, 112, 200, 110, 255, 255, 255);
  fillRect(renderedPng, 468, 128, 100, 14, 100, 116, 139);
  fillRect(renderedPng, 468, 156, 110, 28, 15, 23, 42);

  const renderedBuf = await encodePng(renderedPng);
  const renderedPath = path.join(EXAMPLE_DIR, 'rendered-dashboard.png');
  await fs.promises.writeFile(renderedPath, renderedBuf);

  // 3. Diff Image
  const diffPath = path.join(EXAMPLE_DIR, 'diff-dashboard.png');
  const result = await compareImages(refPath, renderedPath, {
    threshold: 0.1,
    diffPath
  });

  console.log('Analytics Dashboard example images generated:');
  console.log(`- Reference: ${refPath}`);
  console.log(`- Rendered:  ${renderedPath}`);
  console.log(`- Diff:      ${diffPath}`);
  console.log(`- Discrepancy: ${result.diffPixels} pixels (${result.diffPercentage}%)`);
  console.log(`- Bounding Box:`, result.boundingBox);
}

generateDashboardImages().catch(console.error);
