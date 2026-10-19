import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { encodePng, compareImages } from '../../src/diff.js';

const EXAMPLE_DIR = path.resolve('examples/03-ecommerce-product-card');

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

function drawCircle(png, cx, cy, radius, r, g, b, a = 255) {
  const r2 = radius * radius;
  for (let y = Math.round(cy - radius); y <= Math.round(cy + radius); y++) {
    for (let x = Math.round(cx - radius); x <= Math.round(cx + radius); x++) {
      const dist2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (dist2 <= r2 && x >= 0 && x < png.width && y >= 0 && y < png.height) {
        const idx = (y * png.width + x) * 4;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

function drawCircleRing(png, cx, cy, innerRadius, outerRadius, r, g, b, a = 255) {
  const in2 = innerRadius * innerRadius;
  const out2 = outerRadius * outerRadius;
  for (let y = Math.round(cy - outerRadius); y <= Math.round(cy + outerRadius); y++) {
    for (let x = Math.round(cx - outerRadius); x <= Math.round(cx + outerRadius); x++) {
      const dist2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (dist2 >= in2 && dist2 <= out2 && x >= 0 && x < png.width && y >= 0 && y < png.height) {
        const idx = (y * png.width + x) * 4;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

async function generateEcommerceImages() {
  await fs.promises.mkdir(EXAMPLE_DIR, { recursive: true });

  const width = 600;
  const height = 600;

  // 1. Reference Image
  const refPng = new PNG({ width, height });
  // Canvas bg (#f1f5f9)
  fillRect(refPng, 0, 0, width, height, 241, 245, 249);
  // Centered Card container: x: 110..490 (w: 380), y: 40..560 (h: 520) (#ffffff)
  fillRect(refPng, 110, 40, 380, 520, 255, 255, 255);
  // Card image hero area: x: 130..470 (w: 340), y: 60..290 (h: 230) (#0f172a)
  fillRect(refPng, 130, 60, 340, 230, 15, 23, 42);
  // Graphic accent in image: (#38bdf8), x: 260..340, y: 130..220
  fillRect(refPng, 260, 130, 80, 90, 56, 189, 248);

  // Title: x: 130..390, y: 310..330 (#0f172a)
  fillRect(refPng, 130, 310, 260, 20, 15, 23, 42);
  // Price: x: 130..220, y: 340..362 (#2563eb)
  fillRect(refPng, 130, 340, 90, 22, 37, 99, 235);

  // Color swatches: 3 circular swatches at y: 390
  drawCircle(refPng, 144, 390, 12, 30, 41, 59);
  drawCircle(refPng, 184, 390, 12, 37, 99, 235);
  drawCircleRing(refPng, 184, 390, 14, 17, 37, 99, 235); // active ring
  drawCircle(refPng, 224, 390, 12, 148, 163, 184);

  // Quantity stepper [- 1 +], 44x44px touch targets at y: 424..468 (h: 44px)
  fillRect(refPng, 130, 424, 44, 44, 226, 232, 240);
  fillRect(refPng, 174, 424, 44, 44, 241, 245, 249);
  fillRect(refPng, 218, 424, 44, 44, 226, 232, 240);

  // Add to Cart CTA: x: 130..470 (w: 340), y: 486..536 (h: 50) (#2563eb)
  fillRect(refPng, 130, 486, 340, 50, 37, 99, 235);

  const refBuf = await encodePng(refPng);
  const refPath = path.join(EXAMPLE_DIR, 'reference-card.png');
  await fs.promises.writeFile(refPath, refBuf);

  // 2. Candidate Rendered Image:
  // Discrepancy 1: Swatch 2 active selection ring omitted
  // Discrepancy 2: Stepper buttons undersized (30x30px at y: 431 instead of 44x44px)
  const renderedPng = new PNG({ width, height });
  refPng.data.copy(renderedPng.data);
  drawCircleRing(renderedPng, 184, 390, 14, 18, 255, 255, 255);
  fillRect(renderedPng, 130, 424, 140, 48, 255, 255, 255);
  fillRect(renderedPng, 130, 431, 30, 30, 226, 232, 240);
  fillRect(renderedPng, 160, 431, 30, 30, 241, 245, 249);
  fillRect(renderedPng, 190, 431, 30, 30, 226, 232, 240);

  const renderedBuf = await encodePng(renderedPng);
  const renderedPath = path.join(EXAMPLE_DIR, 'rendered-card.png');
  await fs.promises.writeFile(renderedPath, renderedBuf);

  // 3. Diff Image
  const diffPath = path.join(EXAMPLE_DIR, 'diff-card.png');
  const result = await compareImages(refPath, renderedPath, {
    threshold: 0.1,
    diffPath
  });

  console.log('Ecommerce Product Card example images generated:');
  console.log(`- Reference: ${refPath}`);
  console.log(`- Rendered:  ${renderedPath}`);
  console.log(`- Diff:      ${diffPath}`);
  console.log(`- Discrepancy: ${result.diffPixels} pixels (${result.diffPercentage}%)`);
  console.log(`- Bounding Box:`, result.boundingBox);
}

generateEcommerceImages().catch(console.error);
