import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { encodePng } from '../../src/diff.js';

const FIXTURES_DIR = path.resolve('tests/fixtures');

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

export async function createTestFixtures() {
  await fs.promises.mkdir(FIXTURES_DIR, { recursive: true });

  // 1. Base 800x600 reference
  const basePng = new PNG({ width: 800, height: 600 });
  // Background: white (#ffffff)
  fillRect(basePng, 0, 0, 800, 600, 255, 255, 255);
  // Header: dark blue (#0f172a), y: 0..60
  fillRect(basePng, 0, 0, 800, 60, 15, 23, 42);
  // Card: light gray (#f1f5f9), x: 50..750, y: 100..400
  fillRect(basePng, 50, 100, 700, 300, 241, 245, 249);
  // Primary CTA button: royal blue (#2563eb), x: 100..260, y: 300..348
  fillRect(basePng, 100, 300, 160, 48, 37, 99, 235);

  const baseBuf = await encodePng(basePng);
  await fs.promises.writeFile(path.join(FIXTURES_DIR, 'base-800x600.png'), baseBuf);
  await fs.promises.writeFile(path.join(FIXTURES_DIR, 'identical-800x600.png'), baseBuf);

  // 2. Color shift: CTA button changed to orange (#f97316)
  const colorShiftPng = new PNG({ width: 800, height: 600 });
  basePng.data.copy(colorShiftPng.data);
  fillRect(colorShiftPng, 100, 300, 160, 48, 249, 115, 22);
  const colorBuf = await encodePng(colorShiftPng);
  await fs.promises.writeFile(path.join(FIXTURES_DIR, 'color-shift-800x600.png'), colorBuf);

  // 3. Layout shift: Card moved down 30px
  const layoutShiftPng = new PNG({ width: 800, height: 600 });
  fillRect(layoutShiftPng, 0, 0, 800, 600, 255, 255, 255);
  fillRect(layoutShiftPng, 0, 0, 800, 60, 15, 23, 42);
  // Shifted Card: y: 130..430
  fillRect(layoutShiftPng, 50, 130, 700, 300, 241, 245, 249);
  // Shifted CTA: y: 330..378
  fillRect(layoutShiftPng, 100, 330, 160, 48, 37, 99, 235);
  const layoutBuf = await encodePng(layoutShiftPng);
  await fs.promises.writeFile(path.join(FIXTURES_DIR, 'layout-shift-800x600.png'), layoutBuf);

  // 4. Missing element: button removed (painted over with card background)
  const missingPng = new PNG({ width: 800, height: 600 });
  basePng.data.copy(missingPng.data);
  fillRect(missingPng, 100, 300, 160, 48, 241, 245, 249);
  const missingBuf = await encodePng(missingPng);
  await fs.promises.writeFile(path.join(FIXTURES_DIR, 'missing-element-800x600.png'), missingBuf);

  // 5. Dimension mismatch: 800x800
  const dimMismatchPng = new PNG({ width: 800, height: 800 });
  fillRect(dimMismatchPng, 0, 0, 800, 800, 200, 200, 200);
  const dimMismatchBuf = await encodePng(dimMismatchPng);
  await fs.promises.writeFile(path.join(FIXTURES_DIR, 'dim-800x800.png'), dimMismatchBuf);

  // 6. Corrupt file: not a valid PNG
  await fs.promises.writeFile(
    path.join(FIXTURES_DIR, 'corrupt.png'),
    Buffer.from('THIS IS NOT A VALID PNG HEADER CONTENT')
  );

  // 7. Sample skill directories for manifest testing
  const sampleSkillsDir = path.join(FIXTURES_DIR, 'sample-skills');
  await fs.promises.mkdir(path.join(sampleSkillsDir, 'valid-skill', 'references'), { recursive: true });
  await fs.promises.writeFile(
    path.join(sampleSkillsDir, 'valid-skill', 'references', 'doc.md'),
    '# Reference Documentation'
  );
  await fs.promises.writeFile(
    path.join(sampleSkillsDir, 'valid-skill', 'SKILL.md'),
    `---
name: valid-skill
description: >-
  A valid sample skill used for automated manifest testing and verification.
---

# Valid Skill

See [Reference Doc](./references/doc.md) for details.
`
  );

  // Missing name
  await fs.promises.mkdir(path.join(sampleSkillsDir, 'missing-name'), { recursive: true });
  await fs.promises.writeFile(
    path.join(sampleSkillsDir, 'missing-name', 'SKILL.md'),
    `---
description: Missing name field
---
# Missing Name
`
  );

  // Missing description
  await fs.promises.mkdir(path.join(sampleSkillsDir, 'missing-desc'), { recursive: true });
  await fs.promises.writeFile(
    path.join(sampleSkillsDir, 'missing-desc', 'SKILL.md'),
    `---
name: missing-desc
---
# Missing Description
`
  );

  // Broken markdown link
  await fs.promises.mkdir(path.join(sampleSkillsDir, 'broken-link'), { recursive: true });
  await fs.promises.writeFile(
    path.join(sampleSkillsDir, 'broken-link', 'SKILL.md'),
    `---
name: broken-link
description: Skill containing a broken relative link.
---
# Broken Link
See [Missing Guide](./references/does-not-exist.md)
`
  );

  console.log('Test fixtures created successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('generate-fixtures.js')) {
  createTestFixtures().catch(console.error);
}
