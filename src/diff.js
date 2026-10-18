import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { compareDimensions } from './dimensions.js';

/**
 * Decodes a PNG file buffer into a PNG object with data buffer.
 * @param {string} filePath 
 * @returns {Promise<PNG>}
 */
export async function loadPng(filePath) {
  const buf = await fs.promises.readFile(filePath);
  return new Promise((resolve, reject) => {
    const png = new PNG();
    png.parse(buf, (err, data) => {
      if (err) return reject(new Error(`Failed to parse PNG at ${filePath}: ${err.message}`));
      resolve(data);
    });
  });
}

/**
 * Encodes a PNG instance to a Buffer.
 * @param {PNG} png 
 * @returns {Promise<Buffer>}
 */
export function encodePng(png) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    png.pack()
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', err => reject(err));
  });
}

/**
 * Compares two PNG images using pixelmatch.
 * 
 * @param {string} refPath - Path to reference image
 * @param {string} candidatePath - Path to candidate/rendered image
 * @param {object} [options]
 * @param {number} [options.threshold=0.1] - Matching threshold (0.0 exact to 1.0 extremely loose)
 * @param {string} [options.diffPath] - Output path for visual diff image
 * @param {boolean} [options.includeAA=false] - Whether to detect and ignore antialiasing
 * @param {number} [options.maxDiffPercentage=0.0] - Maximum allowed difference percentage to pass
 * @param {number} [options.maxDiffPixels=0] - Maximum allowed difference pixel count to pass
 * @returns {Promise<{
 *   passed: boolean,
 *   dimensions: { width: number, height: number },
 *   totalPixels: number,
 *   diffPixels: number,
 *   diffPercentage: number,
 *   threshold: number,
 *   boundingBox: { minX: number, minY: number, maxX: number, maxY: number } | null,
 *   diffImagePath?: string,
 *   method: string
 * }>}
 */
export async function compareImages(refPath, candidatePath, options = {}) {
  const {
    threshold = 0.1,
    diffPath,
    includeAA = false,
    maxDiffPercentage = 0.0,
    maxDiffPixels = 0
  } = options;

  // 1. Validate files exist and check dimensions
  const dimCheck = await compareDimensions(refPath, candidatePath);
  if (!dimCheck.match) {
    const err = new Error(dimCheck.difference);
    err.code = 'DIMENSION_MISMATCH';
    err.refDimensions = dimCheck.ref;
    err.candidateDimensions = dimCheck.test;
    throw err;
  }

  const { width, height } = dimCheck.ref;
  const totalPixels = width * height;

  // 2. Load PNG data
  const [img1, img2] = await Promise.all([
    loadPng(refPath),
    loadPng(candidatePath)
  ]);

  // 3. Prepare diff image buffer
  const diffPng = new PNG({ width, height });

  // 4. Run pixelmatch
  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diffPng.data,
    width,
    height,
    {
      threshold,
      includeAA,
      diffColor: [255, 0, 128], // High-visibility magenta for discrepancies
      aaColor: [255, 255, 0]      // Yellow for antialiasing differences
    }
  );

  // 5. Calculate bounding box of diff pixels
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  if (diffPixels > 0) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Check if diff pixel (magenta: 255, 0, 128)
        if (diffPng.data[idx] === 255 && diffPng.data[idx + 1] === 0 && diffPng.data[idx + 2] === 128) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  const boundingBox = (maxX >= minX && maxY >= minY)
    ? { minX, minY, maxX, maxY, width: (maxX - minX + 1), height: (maxY - minY + 1) }
    : null;

  const diffPercentage = Number(((diffPixels / totalPixels) * 100).toFixed(4));
  
  let passed;
  if (maxDiffPercentage > 0 && maxDiffPixels === 0) {
    passed = diffPercentage <= maxDiffPercentage;
  } else if (maxDiffPixels > 0 && maxDiffPercentage === 0) {
    passed = diffPixels <= maxDiffPixels;
  } else if (maxDiffPixels > 0 && maxDiffPercentage > 0) {
    passed = diffPixels <= maxDiffPixels && diffPercentage <= maxDiffPercentage;
  } else {
    passed = diffPixels === 0;
  }

  // 6. Write diff image if requested
  let savedDiffPath;
  if (diffPath) {
    const resolvedDiffPath = path.resolve(diffPath);
    await fs.promises.mkdir(path.dirname(resolvedDiffPath), { recursive: true });
    const diffBuf = await encodePng(diffPng);
    await fs.promises.writeFile(resolvedDiffPath, diffBuf);
    savedDiffPath = resolvedDiffPath;
  }

  return {
    passed,
    dimensions: { width, height },
    totalPixels,
    diffPixels,
    diffPercentage,
    threshold,
    boundingBox,
    diffImagePath: savedDiffPath,
    method: `pixelmatch (threshold=${threshold}, includeAA=${includeAA})`
  };
}
