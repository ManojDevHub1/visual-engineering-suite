#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/**
 * Portable, zero-dependency image dimension inspector for PNG and JPEG files.
 * Works independently of host project directory structure.
 */
function getImageDimensions(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    throw new Error(`Path is not a regular file: ${filePath}`);
  }

  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(2048);
  let bytesRead = 0;
  try {
    bytesRead = fs.readSync(fd, buffer, 0, 2048, 0);
  } finally {
    fs.closeSync(fd);
  }

  if (bytesRead < 24) {
    throw new Error(`File is too small to be a valid image: ${filePath}`);
  }

  // 1. Check PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
                buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A;

  if (isPng) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height, format: 'png', sizeBytes: stat.size };
  }

  // 2. Check JPEG: FF D8
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let offset = 2;
    while (offset < bytesRead) {
      if (buffer[offset] !== 0xFF) break;
      const marker = buffer[offset + 1];
      // Standalone markers without length
      if (marker === 0xD9 || marker === 0xDA) break; // EOI or SOS
      if (offset + 4 > bytesRead) break;
      const length = buffer.readUInt16BE(offset + 2);

      // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15 (Start of Frame)
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

  throw new Error(`Unsupported or unrecognized image format for file: ${filePath}`);
}

async function run() {
  const targetImage = process.argv[2];
  if (!targetImage) {
    console.error('Usage: node check-dimensions.js <imagePath>');
    process.exit(1);
  }

  try {
    const dim = getImageDimensions(path.resolve(targetImage));
    console.log(JSON.stringify(dim, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(`Error inspecting image: ${err.message}`);
    process.exit(2);
  }
}

run();
