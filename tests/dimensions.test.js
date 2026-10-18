import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { getImageDimensions, compareDimensions } from '../src/dimensions.js';

const FIXTURES_DIR = path.resolve('tests/fixtures');

describe('Image Dimension Inspector & Comparator', () => {
  const basePath = path.join(FIXTURES_DIR, 'base-800x600.png');
  const identicalPath = path.join(FIXTURES_DIR, 'identical-800x600.png');
  const dim800x800Path = path.join(FIXTURES_DIR, 'dim-800x800.png');
  const corruptPath = path.join(FIXTURES_DIR, 'corrupt.png');

  test('extracts correct dimensions from standard PNG', async () => {
    const dim = await getImageDimensions(basePath);
    assert.strictEqual(dim.width, 800);
    assert.strictEqual(dim.height, 600);
    assert.strictEqual(dim.format, 'png');
    assert.ok(dim.sizeBytes > 0);
  });

  test('compares identical image dimensions with match: true', async () => {
    const res = await compareDimensions(basePath, identicalPath);
    assert.strictEqual(res.match, true);
    assert.strictEqual(res.ref.width, 800);
    assert.strictEqual(res.ref.height, 600);
    assert.strictEqual(res.test.width, 800);
    assert.strictEqual(res.test.height, 600);
    assert.strictEqual(res.difference, undefined);
  });

  test('detects dimension mismatch between 800x600 and 800x800', async () => {
    const res = await compareDimensions(basePath, dim800x800Path);
    assert.strictEqual(res.match, false);
    assert.strictEqual(res.ref.height, 600);
    assert.strictEqual(res.test.height, 800);
    assert.ok(res.difference.includes('Dimension mismatch'));
  });

  test('throws descriptive error on missing file', async () => {
    await assert.rejects(
      async () => getImageDimensions(path.join(FIXTURES_DIR, 'non-existent.png')),
      /File not found/
    );
  });

  test('throws error on corrupt PNG file', async () => {
    await assert.rejects(
      async () => getImageDimensions(corruptPath),
      /Failed to decode image|corrupt/
    );
  });

  test('extracts correct dimensions from JPEG header (600x400)', async () => {
    const jpegPath = path.join(FIXTURES_DIR, 'sample-600x400.jpg');
    const dim = await getImageDimensions(jpegPath);
    assert.strictEqual(dim.width, 600);
    assert.strictEqual(dim.height, 400);
    assert.strictEqual(dim.format, 'jpeg');
    assert.ok(dim.sizeBytes > 0);
  });
});
