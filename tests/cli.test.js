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
});
