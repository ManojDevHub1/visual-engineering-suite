import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { packagePlugin } from '../src/pack.js';

describe('Plugin Packager & Staging Builder (src/pack.js)', () => {
  test('validates plugin readiness with validateOnly: true', async () => {
    const res = await packagePlugin({
      sourceDir: process.cwd(),
      validateOnly: true
    });

    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.errors.length, 0);
    assert.strictEqual(res.skillsCount, 7);
    assert.strictEqual(res.pluginMetadata.name, 'visual-engineering-suite');
  });

  test('fails validation when plugin.json is missing', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ves-pack-empty-'));
    try {
      const res = await packagePlugin({ sourceDir: tempDir });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('Missing plugin.json')));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('packages clean distribution bundle and generates ves-bundle.json', async () => {
    const tempDest = fs.mkdtempSync(path.join(os.tmpdir(), 'ves-pack-dest-'));
    try {
      const res = await packagePlugin({
        sourceDir: process.cwd(),
        destDir: tempDest
      });

      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.destDir, tempDest);
      assert.ok(res.bundledFilesCount > 30);
      assert.ok(res.bundledBytes > 50000);

      // Verify copied essential files
      assert.ok(fs.existsSync(path.join(tempDest, 'plugin.json')));
      assert.ok(fs.existsSync(path.join(tempDest, 'README.md')));
      assert.ok(fs.existsSync(path.join(tempDest, 'LICENSE')));
      assert.ok(fs.existsSync(path.join(tempDest, 'package.json')));
      assert.ok(fs.existsSync(path.join(tempDest, 'rules', 'AGENTS.md')));
      assert.ok(fs.existsSync(path.join(tempDest, 'assets', 'logo.svg')));

      // Verify skills copied
      assert.ok(fs.existsSync(path.join(tempDest, 'skills', 'visual-reconstruction', 'SKILL.md')));
      assert.ok(fs.existsSync(path.join(tempDest, 'skills', 'visual-refinement-loop', 'SKILL.md')));

      // Verify bundle manifest
      assert.ok(fs.existsSync(res.bundleManifestPath));
      const manifest = JSON.parse(fs.readFileSync(res.bundleManifestPath, 'utf8'));

      assert.strictEqual(manifest.bundleFormat, 'antigravity-plugin-v1');
      assert.strictEqual(manifest.plugin.name, 'visual-engineering-suite');
      assert.strictEqual(manifest.skills.length, 7);
      assert.ok(manifest.files['plugin.json']);
      assert.ok(manifest.files['skills/visual-reconstruction/SKILL.md']);
    } finally {
      fs.rmSync(tempDest, { recursive: true, force: true });
    }
  });
});
