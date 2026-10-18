import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { compareImages } from '../src/diff.js';

const FIXTURES_DIR = path.resolve('tests/fixtures');
const OUTPUT_DIR = path.resolve('tests/output');

describe('Visual Regression Engine (compareImages)', () => {
  const basePath = path.join(FIXTURES_DIR, 'base-800x600.png');
  const identicalPath = path.join(FIXTURES_DIR, 'identical-800x600.png');
  const colorShiftPath = path.join(FIXTURES_DIR, 'color-shift-800x600.png');
  const layoutShiftPath = path.join(FIXTURES_DIR, 'layout-shift-800x600.png');
  const missingElementPath = path.join(FIXTURES_DIR, 'missing-element-800x600.png');
  const dim800x800Path = path.join(FIXTURES_DIR, 'dim-800x800.png');

  test('identical images result in 0 mismatched pixels and pass', async () => {
    const res = await compareImages(basePath, identicalPath);
    assert.strictEqual(res.passed, true);
    assert.strictEqual(res.diffPixels, 0);
    assert.strictEqual(res.diffPercentage, 0);
    assert.strictEqual(res.boundingBox, null);
    assert.strictEqual(res.totalPixels, 800 * 600);
  });

  test('detects color discrepancy and accurately bounds the changed region', async () => {
    const diffOut = path.join(OUTPUT_DIR, 'color-shift-diff.png');
    const res = await compareImages(basePath, colorShiftPath, {
      threshold: 0.1,
      diffPath: diffOut
    });

    assert.strictEqual(res.passed, false);
    assert.ok(res.diffPixels > 0, 'diffPixels should be greater than 0');
    assert.ok(res.diffPercentage > 0, 'diffPercentage should be greater than 0');
    assert.ok(res.boundingBox !== null, 'boundingBox must be present');

    // Expected button coordinates: x: 100..259, y: 300..347
    assert.strictEqual(res.boundingBox.minX, 100);
    assert.strictEqual(res.boundingBox.minY, 300);
    assert.strictEqual(res.boundingBox.maxX, 259);
    assert.strictEqual(res.boundingBox.maxY, 347);

    // Verify diff image was created
    assert.ok(fs.existsSync(diffOut), 'Visual diff image file must exist');
  });

  test('detects layout displacement discrepancy', async () => {
    const res = await compareImages(basePath, layoutShiftPath, { threshold: 0.1 });
    assert.strictEqual(res.passed, false);
    assert.ok(res.diffPixels > 0);
    assert.ok(res.boundingBox !== null);
  });

  test('detects missing element discrepancy', async () => {
    const res = await compareImages(basePath, missingElementPath, { threshold: 0.1 });
    assert.strictEqual(res.passed, false);
    assert.ok(res.diffPixels > 0);
    // Button area should be bounded
    assert.strictEqual(res.boundingBox.minX, 100);
    assert.strictEqual(res.boundingBox.minY, 300);
    assert.strictEqual(res.boundingBox.maxX, 259);
    assert.strictEqual(res.boundingBox.maxY, 347);
  });

  test('throws DIMENSION_MISMATCH when comparing images of different sizes', async () => {
    await assert.rejects(
      async () => compareImages(basePath, dim800x800Path),
      (err) => {
        assert.strictEqual(err.code, 'DIMENSION_MISMATCH');
        assert.strictEqual(err.refDimensions.height, 600);
        assert.strictEqual(err.candidateDimensions.height, 800);
        return true;
      }
    );
  });

  test('respects maxDiffPercentage allowance', async () => {
    // If we allow up to 10% diff, a small button color shift (< 2%) should pass
    const res = await compareImages(basePath, colorShiftPath, {
      threshold: 0.1,
      maxDiffPercentage: 10.0
    });
    assert.strictEqual(res.passed, true);
    assert.ok(res.diffPercentage < 10.0);
  });
});
