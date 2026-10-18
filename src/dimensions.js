import fs from 'node:fs';
import { PNG } from 'pngjs';

/**
 * Reads PNG dimensions. First attempts fast header parse (first 24 bytes).
 * Falls back to full PNG decode if necessary.
 * 
 * @param {string} filePath - Absolute or relative path to image file
 * @returns {Promise<{width: number, height: number, format: string, sizeBytes: number}>}
 */
export async function getImageDimensions(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stat = await fs.promises.stat(filePath);
  if (!stat.isFile()) {
    throw new Error(`Path is not a regular file: ${filePath}`);
  }

  const fd = await fs.promises.open(filePath, 'r');
  const headerBuf = Buffer.alloc(24);
  try {
    const { bytesRead } = await fd.read(headerBuf, 0, 24, 0);
    if (bytesRead >= 24) {
      // Check PNG magic: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
      const isPng = headerBuf[0] === 0x89 &&
                    headerBuf[1] === 0x50 &&
                    headerBuf[2] === 0x4E &&
                    headerBuf[3] === 0x47 &&
                    headerBuf[4] === 0x0D &&
                    headerBuf[5] === 0x0A &&
                    headerBuf[6] === 0x1A &&
                    headerBuf[7] === 0x0A;

      if (isPng) {
        // IHDR chunk data begins at offset 16 (width: 4 bytes BE, height: 4 bytes BE)
        const width = headerBuf.readUInt32BE(16);
        const height = headerBuf.readUInt32BE(20);
        return { width, height, format: 'png', sizeBytes: stat.size };
      }
    }
  } finally {
    await fd.close();
  }

  // Fallback: decode via PNG stream to handle edge cases or verify integrity
  const fileBuffer = await fs.promises.readFile(filePath);
  return new Promise((resolve, reject) => {
    const png = new PNG();
    png.parse(fileBuffer, (err, data) => {
      if (err) {
        return reject(new Error(`Failed to decode image at ${filePath}: ${err.message}`));
      }
      resolve({
        width: data.width,
        height: data.height,
        format: 'png',
        sizeBytes: stat.size
      });
    });
  });
}

/**
 * Asserts that two images have identical dimensions.
 *
 * @param {string} refPath
 * @param {string} testPath
 * @returns {Promise<{match: boolean, ref: {width: number, height: number}, test: {width: number, height: number}, difference?: string}>}
 */
export async function compareDimensions(refPath, testPath) {
  const [ref, test] = await Promise.all([
    getImageDimensions(refPath),
    getImageDimensions(testPath)
  ]);

  const match = ref.width === test.width && ref.height === test.height;
  return {
    match,
    ref: { width: ref.width, height: ref.height },
    test: { width: test.width, height: test.height },
    difference: match ? undefined : `Dimension mismatch: Reference is ${ref.width}x${ref.height}px, but candidate is ${test.width}x${test.height}px.`
  };
}
