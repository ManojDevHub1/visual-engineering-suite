import { test, describe } from 'node:test';
import assert from 'node:assert';
import { auditEnvironment } from '../src/env.js';

describe('Environment Capability Auditor', () => {
  test('returns structured audit object with required fields', async () => {
    const audit = await auditEnvironment();

    assert.ok(audit.timestamp);
    assert.ok(audit.runtime.node.version);
    assert.strictEqual(audit.runtime.node.supported, true);
    assert.strictEqual(typeof audit.runtime.npm.available, 'boolean');
    assert.strictEqual(typeof audit.runtime.git.available, 'boolean');

    assert.strictEqual(audit.libraries.pngjs.available, true);
    assert.strictEqual(audit.libraries.pixelmatch.available, true);
    assert.strictEqual(typeof audit.libraries.playwright.available, 'boolean');

    assert.strictEqual(audit.capabilities.dimensionValidation, true);
    assert.strictEqual(audit.capabilities.visualDiff, true);
    assert.strictEqual(audit.capabilities.manifestValidation, true);

    assert.ok(audit.agents.antigravity);
    assert.ok(audit.agents.claudeCode);
    assert.ok(audit.agents.cursor);
  });
});
