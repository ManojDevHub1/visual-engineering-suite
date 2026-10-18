import fs from 'node:fs';
import path from 'node:path';

const FIXTURES_DIR = path.resolve('tests/fixtures');

export function createMinimalJpeg() {
  // Minimal valid JPEG header with 600x400 dimensions (SOF0 marker)
  const buf = Buffer.from([
    0xFF, 0xD8,                         // SOI
    0xFF, 0xE0, 0x00, 0x10,             // APP0 length 16
    0x4A, 0x46, 0x49, 0x46, 0x00,       // 'JFIF\0'
    0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    0xFF, 0xC0, 0x00, 0x11,             // SOF0 length 17
    0x08,                               // Precision 8
    0x01, 0x90,                         // Height = 400 (0x0190)
    0x02, 0x58,                         // Width = 600 (0x0258)
    0x03,                               // 3 components
    0x01, 0x22, 0x00,
    0x02, 0x11, 0x01,
    0x03, 0x11, 0x01,
    0xFF, 0xD9                          // EOI
  ]);

  const jpegPath = path.join(FIXTURES_DIR, 'sample-600x400.jpg');
  fs.writeFileSync(jpegPath, buf);
  return jpegPath;
}

if (process.argv[1] && process.argv[1].endsWith('create-jpeg-fixture.js')) {
  createMinimalJpeg();
  console.log('JPEG fixture created.');
}
