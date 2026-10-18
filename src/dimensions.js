import fs from 'node:fs';
import { PNG } from 'pngjs';

/**
 * Reads image dimensions. Fast header parsing for PNG and JPEG (first 2KB).
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
  const buffer = Buffer.alloc(2048);
  let bytesRead = 0;
  try {
    const res = await fd.read(buffer, 0, 2048, 0);
    bytesRead = res.bytesRead;
  } finally {
    await fd.close();
  }

  if (bytesRead >= 24) {
    // 1. Check PNG magic: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    const isPng = buffer[0] === 0x89 &&
                  buffer[1] === 0x50 &&
                  buffer[2] === 0x4E &&
                  buffer[3] === 0x47 &&
                  buffer[4] === 0x0D &&
                  buffer[5] === 0x0A &&
                  buffer[6] === 0x1A &&
                  buffer[7] === 0x0A;

    if (isPng) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height, format: 'png', sizeBytes: stat.size };
    }

    // 2. Check JPEG: 0xFF 0xD8
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset < bytesRead) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];
        if (marker === 0xD9 || marker === 0xDA) break; // EOI or SOS
        if (offset + 4 > bytesRead) break;
        const length = buffer.readUInt16BE(offset + 2);

        const isSof = (marker >= 0xC0 && marker <= 0xC3) ||
                      (marker >= 0xC5 && marker <= 0xC7) ||
                      (marker >= 0xC9 && marker <= 0xCB) ||
                      (marker >= 0xCD && marker <= 0xCF);

        if (isSof && offset + 9 <= bytesRead) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height, format: 'jpeg', sizeBytes: stat.size };
        }
        offset += 2 + length;
      }
    }
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
 * @returns {Promise<{match: boolean, ref: {width: number, height: number, format: string}, test: {width: number, height: number, format: string}, difference?: string}>}
 */
export async function compareDimensions(refPath, testPath) {
  const [ref, test] = await Promise.all([
    getImageDimensions(refPath),
    getImageDimensions(testPath)
  ]);

  const match = ref.width === test.width && ref.height === test.height;
  return {
    match,
    ref: { width: ref.width, height: ref.height, format: ref.format },
    test: { width: test.width, height: test.height, format: test.format },
    difference: match ? undefined : `Dimension mismatch: Reference is ${ref.width}x${ref.height}px (${ref.format}), but candidate is ${test.width}x${test.height}px (${test.format}).`
  };
}
