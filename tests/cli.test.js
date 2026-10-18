import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { execSync } from 'node:child_process';

const FIXTURES_DIR = path.resolve('tests/fixtures');

function runCli(command) {
  try {
    const stdout = execSync(`node ${command}`, {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8'
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : ''
    };
  }
}

describe('CLI Quality Tools Integration', () => {
  const basePath = path.join(FIXTURES_DIR, 'base-800x600.png');
  const identicalPath = path.join(FIXTURES_DIR, 'identical-800x600.png');
  const colorShiftPath = path.join(FIXTURES_DIR, 'color-shift-800x600.png');
  const dim800x800Path = path.join(FIXTURES_DIR, 'dim-800x800.png');

  test('ves-env exits with code 0 and valid JSON', () => {
    const res = runCli('bin/ves-env.js --json');
    assert.strictEqual(res.code, 0);
    const parsed = JSON.parse(res.stdout);
    assert.ok(parsed.runtime.node.supported);
  });

  test('ves-dimension returns 0 for matching dimensions', () => {
    const res = runCli(`bin/ves-dimension.js "${basePath}" "${identicalPath}" --json`);
    assert.strictEqual(res.code, 0);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.match, true);
  });

  test('ves-dimension returns 1 for dimension mismatch', () => {
    const res = runCli(`bin/ves-dimension.js "${basePath}" "${dim800x800Path}" --json`);
    assert.strictEqual(res.code, 1);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.match, false);
  });

  test('ves-diff returns 0 for identical images', () => {
    const res = runCli(`bin/ves-diff.js "${basePath}" "${identicalPath}" --json`);
    assert.strictEqual(res.code, 0);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.passed, true);
    assert.strictEqual(parsed.diffPixels, 0);
  });

  test('ves-diff returns 1 for visual discrepancy', () => {
    const res = runCli(`bin/ves-diff.js "${basePath}" "${colorShiftPath}" --json`);
    assert.strictEqual(res.code, 1);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.passed, false);
    assert.ok(parsed.diffPixels > 0);
  });

  test('ves-diff returns 2 for dimension mismatch error', () => {
    const res = runCli(`bin/ves-diff.js "${basePath}" "${dim800x800Path}" --json`);
    assert.strictEqual(res.code, 2);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.code, 'DIMENSION_MISMATCH');
  });

  test('ves-screenshot returns code 2 when Playwright is not installed', () => {
    const res = runCli('bin/ves-screenshot.js https://example.com tests/output/test.png --json');
    assert.strictEqual(res.code, 2);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.code, 'PLAYWRIGHT_NOT_INSTALLED');
  });

  test('ves-diff returns code 2 on non-numeric threshold', () => {
    const res = runCli(`bin/ves-diff.js "${basePath}" "${identicalPath}" --threshold invalid --json`);
    assert.strictEqual(res.code, 2);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.code, 'INVALID_ARGUMENT');
    assert.ok(parsed.error.includes('Invalid --threshold value'));
  });

  test('ves-diff returns code 2 on out-of-bounds threshold (> 1.0)', () => {
    const res = runCli(`bin/ves-diff.js "${basePath}" "${identicalPath}" --threshold 2.5 --json`);
    assert.strictEqual(res.code, 2);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.code, 'INVALID_ARGUMENT');
  });

  test('ves-screenshot returns code 2 on invalid preset', () => {
    const res = runCli('bin/ves-screenshot.js https://example.com tests/output/test.png --preset invalid-device --json');
    assert.strictEqual(res.code, 2);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.code, 'INVALID_ARGUMENT');
    assert.ok(parsed.error.includes('Invalid --preset'));
  });

  test('skill helper check-dimensions.js works standalone on PNG and JPEG', () => {
    const resPng = runCli(`skills/visual-reconstruction/scripts/check-dimensions.js "${basePath}"`);
    assert.strictEqual(resPng.code, 0);
    const parsedPng = JSON.parse(resPng.stdout);
    assert.strictEqual(parsedPng.width, 800);
    assert.strictEqual(parsedPng.format, 'png');

    const jpegPath = path.join(FIXTURES_DIR, 'sample-600x400.jpg');
    const resJpg = runCli(`skills/visual-reconstruction/scripts/check-dimensions.js "${jpegPath}"`);
    assert.strictEqual(resJpg.code, 0);
    const parsedJpg = JSON.parse(resJpg.stdout);
    assert.strictEqual(parsedJpg.width, 600);
    assert.strictEqual(parsedJpg.format, 'jpeg');
  });
});
